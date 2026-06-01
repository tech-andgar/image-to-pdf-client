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
	// Safari's native ReadableStream lacks async iteration pdfjs v6 requires.
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

function buildDocParams(pdfBytes: Uint8Array, password?: string) {
	// Use absolute URLs — pdfjs worker resolves these from a different origin context
	const absBase = `${globalThis.location.origin}${import.meta.env.BASE_URL}`;
	return {
		data: pdfBytes.slice(),
		disableStream: true,
		disableAutoFetch: true,
		cMapUrl: `${absBase}cmaps/`,
		cMapPacked: true,
		standardFontDataUrl: `${absBase}standard_fonts/`,
		useSystemFonts: true,
		wasmUrl: `${absBase}wasm/`,
		iccUrl: `${absBase}iccs/`,
		...(password ? { password } : {}),
	};
}

function isPasswordError(err: unknown, hadPassword: boolean): boolean {
	if (err !== null && typeof err === "object") {
		const name = (err as Record<string, unknown>).name;
		if (name === "PasswordException") return true;
		// pdfjs can't clone PasswordException through worker postMessage on retry
		if (name === "DataCloneError" && hadPassword) return true;
	}
	return false;
}

async function promptPassword(
	filename: string,
	wrongAttempt: boolean,
): Promise<string> {
	const msg = wrongAttempt
		? `Contraseña incorrecta para "${filename}". Intenta de nuevo:`
		: `El PDF "${filename}" está protegido. Ingresa la contraseña:`;
	const input = globalThis.prompt(msg);
	if (input === null)
		throw new Error(`PDF "${filename}" cancelado — contraseña requerida.`);
	return input;
}

async function openPdf(
	pdfjsLib: typeof PdfjsLib,
	pdfBytes: Uint8Array,
	filename: string,
): Promise<{ doc: PdfjsLib.PDFDocumentProxy; wasPasswordProtected: boolean }> {
	let password: string | undefined;
	while (true) {
		try {
			const doc = await pdfjsLib.getDocument(buildDocParams(pdfBytes, password))
				.promise;
			return { doc, wasPasswordProtected: password !== undefined };
		} catch (err) {
			if (!isPasswordError(err, password !== undefined)) throw err;
			password = await promptPassword(filename, password !== undefined);
		}
	}
}

async function renderPageToBlob(
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

async function pageHasVectorText(
	page: PdfjsLib.PDFPageProxy,
): Promise<boolean> {
	const textContent = await page.getTextContent();
	return textContent.items.some(
		(item) => "str" in item && item.str.trim().length > 0,
	);
}

async function buildImageFile(
	page: PdfjsLib.PDFPageProxy,
	pageNum: number,
	file: File,
	pdfBytes: Uint8Array,
	wasPasswordProtected: boolean,
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
	// pdf-lib can't decrypt password-protected streams — use raster-only to avoid blank pages
	const hasText = !wasPasswordProtected && (await pageHasVectorText(page));
	return {
		id: `pdf-${safeName}-p${pageNum}-${Date.now()}`,
		file: pageFile,
		preview: URL.createObjectURL(blob),
		...(hasText ? { pdfSource: { pdfBytes, pageIndex: pageNum - 1 } } : {}),
	};
}

export async function pdfToImageFiles(file: File): Promise<ImageFile[]> {
	const pdfjsLib = await loadPdfjs();
	const pdfBytes = new Uint8Array(await file.arrayBuffer());
	const { doc: pdf, wasPasswordProtected } = await openPdf(
		pdfjsLib,
		pdfBytes,
		file.name,
	);

	if (pdf.numPages > MAX_PDF_PAGES) {
		throw new Error(
			`El PDF tiene ${pdf.numPages} páginas. El límite es ${MAX_PDF_PAGES}.`,
		);
	}

	const results: ImageFile[] = [];
	for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
		const page = await pdf.getPage(pageNum);
		results.push(
			await buildImageFile(page, pageNum, file, pdfBytes, wasPasswordProtected),
		);
	}
	return results;
}
