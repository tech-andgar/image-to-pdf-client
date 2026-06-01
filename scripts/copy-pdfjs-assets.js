import { createRequire } from "node:module";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const pdfjsDir = require
	.resolve("pdfjs-dist/package.json")
	.replace("/package.json", "");

const assets = ["cmaps", "standard_fonts", "wasm", "iccs"];

for (const dir of assets) {
	const src = join(pdfjsDir, dir);
	const dest = join("public", dir);
	if (!existsSync(src)) {
		console.warn(`pdfjs asset not found: ${src}`);
		continue;
	}
	mkdirSync(dest, { recursive: true });
	cpSync(src, dest, { recursive: true });
	console.log(`✓ copied ${dir}`);
}
