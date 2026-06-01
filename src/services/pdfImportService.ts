import type { ImageFile } from "../types/image";
import { MAX_PDF_PAGES } from "../config/limits";
import type * as PdfjsLib from "pdfjs-dist";
import {
	isPasswordError,
	promptPassword,
} from "../lib/pdf/pdf-password-handler";
import { buildImageFile } from "../lib/pdf/pdf-page-renderer";

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

async function openPdf(
	pdfjsLib: typeof PdfjsLib,
	pdfBytes: Uint8Array,
	filename: string,
): Promise<{
	doc: PdfjsLib.PDFDocumentProxy;
	sourceBytesForExport: Uint8Array;
}> {
	let password: string | undefined;
	while (true) {
		try {
			const doc = await pdfjsLib.getDocument(buildDocParams(pdfBytes, password))
				.promise;
			if (password === undefined)
				return { doc, sourceBytesForExport: pdfBytes };
			// Decrypt via mupdf so pdfSource bytes have readable (unencrypted) streams
			const { decryptPdf } = await import("../lib/pdf/decrypt");
			const decrypted = await decryptPdf(pdfBytes, password);
			return { doc, sourceBytesForExport: decrypted };
		} catch (err) {
			if (!isPasswordError(err, password !== undefined)) throw err;
			password = await promptPassword(filename, password !== undefined);
		}
	}
}

export async function pdfToImageFiles(file: File): Promise<ImageFile[]> {
	const pdfjsLib = await loadPdfjs();
	const pdfBytes = new Uint8Array(await file.arrayBuffer());
	const { doc: pdf, sourceBytesForExport } = await openPdf(
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
			await buildImageFile(page, pageNum, file, sourceBytesForExport),
		);
	}
	return results;
}
