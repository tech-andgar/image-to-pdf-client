import type { PDFImage } from "pdf-lib";
import type { ImageFile } from "../types/image";
import { sanitizeFilename, generateFallbackFilename } from "./fileSanitizer";
import type { IUniversalShareService, ShareResult } from "./shareService";
import { createBestShareService } from "./shareService";
import { logger } from "./logger";

// PDF Generator - Single Responsibility: Create PDFs from images
class PdfGenerator {
	async generate(images: ImageFile[]): Promise<Uint8Array> {
		if (images.length === 0) {
			throw new Error("No images provided for PDF generation");
		}

		try {
			// Lazy load pdf-lib to improve initial bundle size
			const { PDFDocument } = await import("pdf-lib");
			const pdfDoc = await PDFDocument.create();

			for (const image of images) {
				if (image.error) {
					logger.warn("Skipping invalid image", { error: image.error });
					continue;
				}

				const imageBytes = await this.fileToUint8Array(image.file);
				let embeddedImage: PDFImage;

				// Embed image based on type
				if (
					image.file.type === "image/jpeg" ||
					image.file.type === "image/jpg"
				) {
					embeddedImage = await pdfDoc.embedJpg(imageBytes);
				} else if (image.file.type === "image/png") {
					embeddedImage = await pdfDoc.embedPng(imageBytes);
				} else {
					// For other formats (BMP, GIF), we'll skip for now as pdf-lib doesn't support them directly
					logger.warn("Unsupported image type for PDF", {
						imageType: image.file.type,
					});
					continue;
				}

				// Calculate page size to maintain aspect ratio
				const { width: imgWidth, height: imgHeight } = embeddedImage;
				const aspectRatio = imgWidth / imgHeight;

				// Standard A4 page size (8.27 x 11.69 inches at 72 DPI = 595 x 842 points)
				const pageWidth = 595;
				const pageHeight = 842;

				let finalWidth: number;
				let finalHeight: number;

				// Scale to fit page while maintaining aspect ratio
				if (aspectRatio > pageWidth / pageHeight) {
					// Image is wider than page aspect ratio
					finalHeight = pageWidth / aspectRatio;
					finalWidth = pageWidth;
				} else {
					// Image is taller than page aspect ratio
					finalWidth = pageHeight * aspectRatio;
					finalHeight = pageHeight;
				}

				// Create page and add image centered
				const page = pdfDoc.addPage([pageWidth, pageHeight]);
				const x = (pageWidth - finalWidth) / 2;
				const y = (pageHeight - finalHeight) / 2;

				page.drawImage(embeddedImage, {
					x,
					y,
					width: finalWidth,
					height: finalHeight,
				});
			}

			if (pdfDoc.getPageCount() === 0) {
				throw new Error("No valid images to include in PDF");
			}

			return await pdfDoc.save();
		} catch (error) {
			logger.error("Error generating PDF", error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to generate PDF",
			);
		}
	}

	// Moved here to follow SRP - this class handles all image/PDF operations
	private async fileToUint8Array(file: File): Promise<Uint8Array> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (reader.result instanceof ArrayBuffer) {
					resolve(new Uint8Array(reader.result));
				} else {
					reject(new Error("Failed to read file"));
				}
			};
			reader.onerror = () =>
				reject(new Error(reader.error?.message || "Failed to read file"));
			reader.readAsArrayBuffer(file);
		});
	}
}

// PDF Downloader - Single Responsibility: Handle file downloads
class PdfDownloader {
	download(pdfBytes: Uint8Array, filename: string): void {
		try {
			const pdfArrayBuffer = new ArrayBuffer(pdfBytes.length);
			const view = new Uint8Array(pdfArrayBuffer);
			view.set(pdfBytes);

			const blob = new Blob([pdfArrayBuffer], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			setTimeout(() => URL.revokeObjectURL(url), 100);
		} catch (error) {
			logger.error("Error downloading PDF", error);
			throw new Error("Failed to download PDF");
		}
	}
}

// PDF Sharer - Single Responsibility: Handle sharing operations
class PdfSharer {
	private shareService: IUniversalShareService;
	private sanitizer = sanitizeFilename;
	private fallbackGenerator = generateFallbackFilename;

	constructor(private downloader: PdfDownloader) {
		this.shareService = createBestShareService();
	}

	async share(pdfBytes: Uint8Array, filename: string): Promise<ShareResult> {
		try {
			// Sanitize filename for cross-platform compatibility
			const safeFilename = this.sanitizer(filename);
			const finalFilename = safeFilename || this.fallbackGenerator();

			// Create File directly - clean implementation
			const fileToShare = new File([new Uint8Array(pdfBytes)], finalFilename, {
				type: "application/pdf",
			});

			const shareData = {
				files: [fileToShare],
				title: filename,
				text: "PDF generado con imágenes convertidas",
				url: window.location.href,
			};

			return await this.shareService.shareFile(shareData);
		} catch (error) {
			logger.error("Error sharing PDF", error);
			return {
				success: false,
				method: "none",
				error:
					error instanceof Error
						? error.message
						: "Error desconocido al compartir",
			};
		}
	}
}

// Global instances following Singleton pattern for simplicity
const pdfGenerator = new PdfGenerator();
const pdfDownloader = new PdfDownloader();
const pdfSharer = new PdfSharer(pdfDownloader);

/**
 * Shares PDF using Web Share API with proper Blob/File creation for Android Chrome compatibility
 */
export async function sharePDF(
	pdfBytes: Uint8Array,
	filename: string = "images.pdf",
): Promise<{ success: boolean; method: string; error?: string }> {
	const result = await pdfSharer.share(pdfBytes, filename);
	return {
		success: result.success,
		method: result.method,
		error: result.error,
	};
}

/**
 * Generates a PDF from an array of ImageFiles in the specified order
 */
export async function generatePDF(images: ImageFile[]): Promise<Uint8Array> {
	return pdfGenerator.generate(images);
}

/**
 * Downloads the PDF with the given filename
 */
export function downloadPDF(
	pdfBytes: Uint8Array,
	filename: string = "images.pdf",
): void {
	pdfDownloader.download(pdfBytes, filename);
}
