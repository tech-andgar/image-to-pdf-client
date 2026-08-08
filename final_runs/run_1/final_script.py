import asyncio
import base64
import os
from pathlib import Path
from playwright.async_api import async_playwright

WORKSPACE = Path(__file__).parent
LOG = WORKSPACE / "final_script_log.txt"
URL = "https://tech-andgar.github.io/image-to-pdf-client-public/"

console_errors = []
network_errors = []
all_requests = []

async def main():
    async with async_playwright() as p:
        browser = await p.firefox.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 1800},
            locale="en-US",
        )
        page = await context.new_page()

        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
        page.on("pageerror", lambda err: console_errors.append(f"[pageerror] {err}"))
        page.on("response", lambda resp: network_errors.append(f"404: {resp.url}") if resp.status == 404 else None)
        page.on("response", lambda resp: all_requests.append(f"{resp.status} {resp.url}") if "wasm" in resp.url.lower() or "mupdf" in resp.url.lower() else None)

        log_lines = []
        log_lines.append(f"Navigating to {URL}")
        await page.goto(URL, wait_until="networkidle", timeout=30000)
        log_lines.append("Page loaded (networkidle)")

        # Screenshot 1: initial load
        await page.screenshot(path=str(WORKSPACE / "screenshot_01_load.png"))
        log_lines.append("Screenshot 1: initial load saved")

        # Wait a bit more for any async WASM loading
        await page.wait_for_timeout(3000)
        await page.screenshot(path=str(WORKSPACE / "screenshot_02_after_wait.png"))
        log_lines.append("Screenshot 2: after 3s wait saved")

        # Try uploading a test image
        # Create a small test PNG
        import struct, zlib
        def make_png(w=100, h=100):
            def chunk(name, data):
                c = struct.pack(">I", len(data)) + name + data
                return c + struct.pack(">I", zlib.crc32(name + data) & 0xffffffff)
            ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
            raw = b""
            for _ in range(h):
                raw += b"\x00" + bytes([128, 0, 0] * w)
            idat = zlib.compress(raw)
            return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")

        test_img = WORKSPACE / "test_image.png"
        test_img.write_bytes(make_png())
        log_lines.append(f"Created test image: {test_img}")

        # Find the file input
        file_input = page.locator('input[type="file"]')
        count = await file_input.count()
        log_lines.append(f"File inputs found: {count}")

        if count > 0:
            await file_input.first.set_input_files(str(test_img))
            log_lines.append("Uploaded test image")
            await page.wait_for_timeout(4000)
            await page.screenshot(path=str(WORKSPACE / "screenshot_03_after_upload.png"))
            log_lines.append("Screenshot 3: after upload saved")

        # Check for any new errors after upload
        await page.wait_for_timeout(2000)

        log_lines.append("\n=== CONSOLE ERRORS/WARNINGS ===")
        for e in console_errors:
            log_lines.append(e)
        if not console_errors:
            log_lines.append("(none)")

        log_lines.append("\n=== NETWORK 404s ===")
        for e in network_errors:
            log_lines.append(e)
        if not network_errors:
            log_lines.append("(none)")

        log_lines.append("\n=== WASM/MUPDF REQUESTS ===")
        for r in all_requests:
            log_lines.append(r)
        if not all_requests:
            log_lines.append("(none - wasm may not have been requested yet)")

        await browser.close()
        LOG.write_text("\n".join(log_lines))
        print("\n".join(log_lines))

asyncio.run(main())
