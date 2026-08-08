/// <reference types="node" />
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

// ─── helpers ─────────────────────────────────────────────────────────────────

function crc32(buf: Buffer): number {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (const byte of buf) crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function makePng(width = 80, height = 80): Buffer {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB

  // Build uncompressed scanlines
  const raw: number[] = [];
  for (let y = 0; y < height; y++) {
    raw.push(0); // filter byte None
    for (let x = 0; x < width; x++) raw.push(200, 50, 50);
  }
  const rawBuf = Buffer.from(raw);

  // zlib store block (no compression, just wrap)
  const len = rawBuf.length;
  const nlen = (~len) & 0xffff;
  const block = Buffer.from([
    0x78, 0x9c,
    0x01,
    len & 0xff, (len >> 8) & 0xff,
    nlen & 0xff, (nlen >> 8) & 0xff,
  ]);
  let s1 = 1, s2 = 0;
  for (const b of rawBuf) { s1 = (s1 + b) % 65521; s2 = (s2 + s1) % 65521; }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE((s2 << 16) | s1);
  const idat = Buffer.concat([block, rawBuf, adler]);

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function tmpPng(): string {
  const path = join(tmpdir(), `pw-test-${process.pid}.png`);
  writeFileSync(path, makePng());
  return path;
}

// ─── tests ───────────────────────────────────────────────────────────────────

test.describe('DocumergePDF — post-deploy smoke', () => {
  test('page loads with no JS errors and no 404s', async ({ page }) => {
    const errors: string[] = [];
    const notFound: string[] = [];

    page.on('pageerror', (err) => errors.push(err.message));
    page.on('response', (res) => {
      if (res.status() === 404) notFound.push(res.url());
    });

    await page.goto('');
    await page.waitForLoadState('networkidle');

    expect(errors, `JS errors: ${errors.join('; ')}`).toHaveLength(0);
    expect(notFound, `404s: ${notFound.join('; ')}`).toHaveLength(0);
  });

  test('mupdf-wasm.wasm loads with HTTP 200', async ({ page }) => {
    const wasmResponses: { url: string; status: number }[] = [];

    page.on('response', (res) => {
      if (res.url().includes('mupdf-wasm.wasm'))
        wasmResponses.push({ url: res.url(), status: res.status() });
    });

    await page.goto('');
    await page.waitForLoadState('networkidle');

    // Upload an image to trigger mupdf lazy-init
    const wasmLoaded = page.waitForResponse(
      (res) => res.url().includes('mupdf-wasm.wasm'),
      { timeout: 15_000 },
    ).catch(() => null);
    await page.locator('input[type="file"]').setInputFiles(tmpPng());
    await wasmLoaded;

    for (const { url, status } of wasmResponses)
      expect(status, `${url} returned ${status}`).toBe(200);
  });

  test('upload image → thumbnail and export section appear', async ({
    page,
  }) => {
    await page.goto('');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="file"]').setInputFiles(tmpPng());

    // Thumbnail should appear
    await expect(page.locator('img').first()).toBeVisible({ timeout: 10_000 });

    // Download button should appear
    await expect(
      page.getByRole('button', { name: /descargar|download/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('filename input pre-filled with date-based default', async ({
    page,
  }) => {
    await page.goto('');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="file"]').setInputFiles(tmpPng());
    await expect(
      page.getByRole('button', { name: /descargar|download/i }),
    ).toBeVisible({ timeout: 10_000 });

    const input = page.getByRole('textbox', { name: /nombre del archivo/i });
    await expect(input).toBeVisible({ timeout: 5_000 });
    const placeholder = await input.getAttribute('placeholder');
    expect(placeholder).toMatch(/\d{4}/);
    expect(placeholder).toMatch(/\.pdf$/);
  });
});
