import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const pdfjsDir = (require.resolve('pdfjs-dist/package.json') as string).replace(
  '/package.json',
  '',
);

const assets = ['cmaps', 'standard_fonts', 'wasm', 'iccs'] as const;

for (const dir of assets) {
  const src = join(pdfjsDir, dir);
  const dest = join('public', dir);
  if (!existsSync(src)) {
    console.warn(`pdfjs asset not found: ${src}`);
    continue;
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`✓ copied ${dir}`);
}

// Copy mupdf WASM to public/wasm/ so it's served at a stable base-relative URL
// (avoids Vite hashing it into /assets/ with an absolute path that breaks GitHub Pages)
const mupdfMain = new URL(import.meta.resolve('mupdf')).pathname;
const mupdfWasm = join(mupdfMain, '../../dist/mupdf-wasm.wasm');
if (existsSync(mupdfWasm)) {
  mkdirSync(join('public', 'wasm'), { recursive: true });
  copyFileSync(mupdfWasm, join('public', 'wasm', 'mupdf-wasm.wasm'));
  console.log('✓ copied mupdf-wasm.wasm');
} else {
  console.warn('mupdf wasm not found:', mupdfWasm);
}
