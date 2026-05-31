import type { ImageFile } from "../types/image";
import {
	MAX_CANVAS_PIXELS,
	MAX_PDF_PAGES,
	DEFAULT_JPEG_QUALITY,
	PDF_RENDER_SCALE,
} from "../config/limits";
import { blobToUint8Array, bitmapToBlob } from "../lib/image/canvas-utils";
import type * as PdfjsLib from "pdfjs-dist";

async function loadPdfjs(): Promise<typeof PdfjsLib> {
	// Safari's native ReadableStream lacks async iteration methods pdfjs v6 requires.
	// Polyfill must be patched into globalThis before pdfjs module executes.
	if (
		typeof ReadableStream !== "undefined" &&
		(!ReadableStream.prototype[Symbol.asyncIterator] ||
			!ReadableStream.prototype.values)
	) {
		const { ReadableStream: PolyReadableStream } = await import(
			"web-streams-polyfill"
		);
		(globalThis as unknown as Record<string, unknown>).ReadableStream =
			PolyReadableStream;
	}
	const pdfjsLib = await import("pdfjs-dist");
	pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
		"pdfjs-dist/build/pdf.worker.min.mjs",
		import.meta.url,
	).href;
	return pdfjsLib;
}

async function renderPageToBlob(
	page: PdfjsLib.PDFPageProxy,
	scale = PDF_RENDER_SCALE,
): Promise<Blob> {
	let viewport = page.getViewport({ scale });

	const pixels = viewport.width * viewport.height;
	if (pixels > MAX_CANVAS_PIXELS) {
		const clampedScale = scale * Math.sqrt(MAX_CANVAS_PIXELS / pixels);
		viewport = page.getViewport({ scale: clampedScale });
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

async function pageHasVectorText(
	page: PdfjsLib.PDFPageProxy,
): Promise<boolean> {
	const textContent = await page.getTextContent();
	return textContent.items.some(
		(item) => "str" in item && item.str.trim().length > 0,
	);
}

export async function pdfToImageFiles(file: File): Promise<ImageFile[]> {
	const pdfjsLib = await loadPdfjs();

	const arrayBuffer = await file.arrayBuffer();
	// Keep original bytes for pdfSource; pass a copy to pdfjs since it transfers the buffer to the worker
	const pdfBytes = new Uint8Array(arrayBuffer);
	const pdf = await pdfjsLib.getDocument({
		data: pdfBytes.slice(),
		disableStream: true,
		disableAutoFetch: true,
	}).promise;

	if (pdf.numPages > MAX_PDF_PAGES) {
		throw new Error(
			`El PDF tiene ${pdf.numPages} páginas. El límite es ${MAX_PDF_PAGES}.`,
		);
	}

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

		const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
		results.push({
			id: `pdf-${safeName}-p${pageNum}-${Date.now()}`,
			file: pageFile,
			preview: URL.createObjectURL(blob),
			...(hasText ? { pdfSource: { pdfBytes, pageIndex: pageNum - 1 } } : {}),
		});
	}

	return results;
}
