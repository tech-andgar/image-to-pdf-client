import type { ImageFile, CompressionPreset } from "../../types/image";
import { PdfGenerator } from "./generator";
import { PdfDownloader } from "./downloader";
import { PdfSharer } from "./sharer";

const generator = new PdfGenerator();
const downloader = new PdfDownloader();
const sharer = new PdfSharer();

export async function generatePDF(
	images: ImageFile[],
	preset?: CompressionPreset,
): Promise<Uint8Array> {
	return generator.generate(images, preset);
}

export function downloadPDF(
	pdfBytes: Uint8Array,
	filename = "images.pdf",
): void {
	downloader.download(pdfBytes, filename);
}

export async function sharePDF(
	pdfBytes: Uint8Array,
	filename = "images.pdf",
): Promise<{ success: boolean; method: string; error?: string }> {
	const result = await sharer.share(pdfBytes, filename);
	return {
		success: result.success,
		method: result.method,
		error: result.error,
	};
}
