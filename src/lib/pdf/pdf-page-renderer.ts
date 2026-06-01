import type * as PdfjsLib from "pdfjs-dist";
import type { ImageFile } from "../../types/image";
import {
	MAX_CANVAS_PIXELS,
	DEFAULT_JPEG_QUALITY,
	PDF_RENDER_SCALE,
} from "../../config/limits";
import { blobToUint8Array, bitmapToBlob } from "../image/canvas-utils";

export async function renderPageToBlob(
	page: PdfjsLib.PDFPageProxy,
	scale = PDF_RENDER_SCALE,
): Promise<Blob> {
	let viewport = page.getViewport({ scale });
	const pixels = viewport.width * viewport.height;
	if (pixels > MAX_CANVAS_PIXELS) {
		viewport = page.getViewport({
			scale: scale * Math.sqrt(MAX_CANVAS_PIXELS / pixels),
		});
	}
	const canvas = document.createElement("canvas");
	canvas.width = viewport.width;
	canvas.height = viewport.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No canvas context");
	await page.render({ canvasContext: ctx, viewport, canvas }).promise;
	const bitmap = await createImageBitmap(canvas);
	const blob = await bitmapToBlob(bitmap, "image/jpeg", DEFAULT_JPEG_QUALITY);
	bitmap.close();
	return blob;
}

export async function pageHasVectorText(
	page: PdfjsLib.PDFPageProxy,
): Promise<boolean> {
	const textContent = await page.getTextContent();
	return textContent.items.some(
		(item) => "str" in item && item.str.trim().length > 0,
	);
}

export async function buildImageFile(
	page: PdfjsLib.PDFPageProxy,
	pageNum: number,
	file: File,
	pdfBytes: Uint8Array,
): Promise<ImageFile> {
	const blob = await renderPageToBlob(page);
	const bytes = await blobToUint8Array(blob);
	const baseName = file.name.replace(/\.pdf$/i, "");
	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const pageFile = new File(
		[bytes.buffer as ArrayBuffer],
		`${baseName}_p${String(pageNum).padStart(3, "0")}.jpg`,
		{ type: "image/jpeg" },
	);
	const hasText = await pageHasVectorText(page);
	return {
		id: `pdf-${safeName}-p${pageNum}-${Date.now()}`,
		file: pageFile,
		preview: URL.createObjectURL(blob),
		...(hasText ? { pdfSource: { pdfBytes, pageIndex: pageNum - 1 } } : {}),
	};
}
