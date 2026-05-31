import { ReadableStream as PolyReadableStream } from "web-streams-polyfill";
import * as pdfjsLib from "pdfjs-dist";
import type { ImageFile } from "../types/image";
import { blobToUint8Array, bitmapToBlob } from "../lib/image/canvas-utils";

// Safari lacks ReadableStream[Symbol.asyncIterator] which pdfjs requires
if (
	typeof ReadableStream !== "undefined" &&
	!ReadableStream.prototype[Symbol.asyncIterator]
) {
	(ReadableStream.prototype as unknown as Record<symbol, unknown>)[
		Symbol.asyncIterator
	] = (PolyReadableStream.prototype as unknown as Record<symbol, unknown>)[
		Symbol.asyncIterator
	];
}

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).href;

async function renderPageToBlob(
	page: pdfjsLib.PDFPageProxy,
	scale = 2,
): Promise<Blob> {
	const viewport = page.getViewport({ scale });
	const canvas = document.createElement("canvas");
	canvas.width = viewport.width;
	canvas.height = viewport.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No canvas context");
	await page.render({ canvasContext: ctx, viewport, canvas }).promise;
	// Use canvas.transferToImageBitmap for efficiency, then bitmapToBlob
	const bitmap = await createImageBitmap(canvas);
	const blob = await bitmapToBlob(bitmap, "image/jpeg", 0.92);
	bitmap.close();
	return blob;
}

async function pageHasVectorText(
	page: pdfjsLib.PDFPageProxy,
): Promise<boolean> {
	const textContent = await page.getTextContent();
	return textContent.items.some(
		(item) => "str" in item && item.str.trim().length > 0,
	);
}

export async function pdfToImageFiles(file: File): Promise<ImageFile[]> {
	const arrayBuffer = await file.arrayBuffer();
	// Keep original bytes for pdfSource; pass a copy to pdfjs since it transfers the buffer to the worker
	const pdfBytes = new Uint8Array(arrayBuffer);
	const pdf = await pdfjsLib.getDocument({
		data: pdfBytes.slice(),
		disableStream: true,
		disableAutoFetch: true,
	}).promise;
	const results: ImageFile[] = [];

	for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
		const page = await pdf.getPage(pageNum);
		const blob = await renderPageToBlob(page);
		const bytes = await blobToUint8Array(blob);

		const baseName = file.name.replace(/\.pdf$/i, "");
		const pageFile = new File(
			[bytes.buffer as ArrayBuffer],
			`${baseName}_p${String(pageNum).padStart(3, "0")}.jpg`,
			{ type: "image/jpeg" },
		);

		const hasText = await pageHasVectorText(page);

		results.push({
			id: `pdf-${file.name}-p${pageNum}-${Date.now()}`,
			file: pageFile,
			preview: URL.createObjectURL(blob),
			...(hasText ? { pdfSource: { pdfBytes, pageIndex: pageNum - 1 } } : {}),
		});
	}

	return results;
}
