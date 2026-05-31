import type { PDFImage } from "pdf-lib";
import type { ImageFile, CompressionPreset } from "../types/image";
import { COMPRESSION_PRESETS } from "../types/image";
import { compressPdfPageImages } from "../lib/pdf/pdf-page-compressor";
import { sanitizeFilename, generateFallbackFilename } from "./fileSanitizer";
import type { IUniversalShareService, ShareResult } from "./shareService";
import { createBestShareService } from "./shareService";
import { logger } from "./logger";
import { storageService } from "./storageService";

// PDF Generator - Single Responsibility: Create PDFs from images
class PdfGenerator {
	async generate(
		images: ImageFile[],
		preset?: CompressionPreset,
	): Promise<Uint8Array> {
		if (images.length === 0) {
			throw new Error("No images provided for PDF generation");
		}

		try {
			const { PDFDocument } = await import("pdf-lib");
			const pdfDoc = await PDFDocument.create();

			// Cache parsed source PDFs to avoid re-parsing same file for multiple pages
			const pdfSourceCache = new Map<
				Uint8Array,
				Awaited<ReturnType<typeof PDFDocument.load>>
			>();

			for (const image of images) {
				if (image.error) {
					logger.warn("Skipping invalid image", { error: image.error });
					continue;
				}

				// PDF-sourced pages: text/vectors are lossless; embedded images get compressed if preset given
				if (image.pdfSource) {
					const { pdfBytes, pageIndex } = image.pdfSource;
					logger.info(
						`[pdf-generator] page from PDF source, pageIndex=${pageIndex}, preset=${preset ?? "none"}`,
					);
					const sourceBytesToLoad = preset
						? await compressPdfPageImages(pdfBytes, pageIndex, {
								quality: COMPRESSION_PRESETS[preset].quality,
								mimeType: "image/jpeg",
							})
						: pdfBytes;
					let srcDoc = pdfSourceCache.get(sourceBytesToLoad);
					if (!srcDoc) {
						srcDoc = await PDFDocument.load(sourceBytesToLoad);
						pdfSourceCache.set(sourceBytesToLoad, srcDoc);
					}
					const [copiedPage] = await pdfDoc.copyPages(srcDoc, [pageIndex]);
					pdfDoc.addPage(copiedPage);
					continue;
				}

				const hasStorage = !!image.storageId;
				if (!hasStorage && !(await this.validateFile(image.file))) {
					throw new Error(
						`Archivo "${image.file.name}" inválido. Reinicie la aplicación y cargue las imágenes nuevamente. Los archivos expiran cuando la aplicación pierde el foco.`,
					);
				}

				let imageBytes: Uint8Array;
				try {
					imageBytes = await this.getImageData(image);
				} catch (error) {
					logger.warn("Failed to get image data", { error });
					if (hasStorage) {
						logger.info("Retrying with raw file object");
						imageBytes = await this.fileToUint8Array(image.file);
					} else {
						throw error;
					}
				}

				let embeddedImage: PDFImage;
				let embedBytes = imageBytes;
				let embedType = image.file.type;

				// Convert unsupported types (WebP, BMP, GIF) to JPEG via canvas
				if (
					embedType !== "image/jpeg" &&
					embedType !== "image/jpg" &&
					embedType !== "image/png"
				) {
					const blobUrl = URL.createObjectURL(
						new Blob([embedBytes.buffer as ArrayBuffer], { type: embedType }),
					);
					try {
						embedBytes = await new Promise<Uint8Array>((resolve, reject) => {
							const img = new Image();
							img.onload = () => {
								const canvas = document.createElement("canvas");
								canvas.width = img.naturalWidth;
								canvas.height = img.naturalHeight;
								const ctx = canvas.getContext("2d");
								if (!ctx) return reject(new Error("No canvas context"));
								ctx.drawImage(img, 0, 0);
								canvas.toBlob(
									(b) => {
										if (!b) return reject(new Error("toBlob failed"));
										b.arrayBuffer().then((ab) => resolve(new Uint8Array(ab)));
									},
									"image/jpeg",
									0.92,
								);
							};
							img.onerror = () => reject(new Error("Image load failed"));
							img.src = blobUrl;
						});
					} finally {
						URL.revokeObjectURL(blobUrl);
					}
					embedType = "image/jpeg";
				}

				if (embedType === "image/jpeg" || embedType === "image/jpg") {
					embeddedImage = await pdfDoc.embedJpg(embedBytes);
				} else {
					embeddedImage = await pdfDoc.embedPng(embedBytes);
				}

				const { width: imgWidth, height: imgHeight } = embeddedImage;
				const page = pdfDoc.addPage([imgWidth, imgHeight]);
				page.drawImage(embeddedImage, {
					x: 0,
					y: 0,
					width: imgWidth,
					height: imgHeight,
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

	// Validate if a File object is still valid (handles background/foreground transitions)
	private async validateFile(file: File): Promise<boolean> {
		try {
			// Simple validation: try to access file size (this will fail if file is invalidated)
			const testSize = file.size;
			if (testSize === undefined || testSize < 0) {
				return false;
			}
			return true;
		} catch (error) {
			logger.warn("File validation failed", { error });
			return false;
		}
	}

	private async getImageData(image: ImageFile): Promise<Uint8Array> {
		// Priority 1: Try to get from IndexedDB if available
		if (image.storageId) {
			try {
				const blob = await storageService.getImage(image.storageId);
				if (blob) {
					return this.blobToUint8Array(blob);
				}
				logger.warn(
					`Image not found in storage: ${image.storageId}, falling back to File object`,
				);
			} catch (err) {
				logger.warn("Error reading from storage", err);
			}
		}

		// Priority 2: Use the File object directly
		return this.fileToUint8Array(image.file);
	}

	private async blobToUint8Array(blob: Blob): Promise<Uint8Array> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (reader.result instanceof ArrayBuffer) {
					resolve(new Uint8Array(reader.result));
				} else {
					reject(new Error("Failed to read blob"));
				}
			};
			reader.onerror = () =>
				reject(new Error(reader.error?.message || "Failed to read blob"));
			reader.readAsArrayBuffer(blob);
		});
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
			link.remove();

			setTimeout(() => URL.revokeObjectURL(url), 100);
		} catch (error) {
			logger.error("Error downloading PDF", error);
			throw new Error("Failed to download PDF");
		}
	}
}

// PDF Sharer - Single Responsibility: Handle sharing operations
class PdfSharer {
	private readonly shareService: IUniversalShareService;
	private readonly sanitizer = sanitizeFilename;
	private readonly fallbackGenerator = generateFallbackFilename;

	constructor(_downloader: PdfDownloader) {
		this.shareService = createBestShareService();
	}

	async share(pdfBytes: Uint8Array, filename: string): Promise<ShareResult> {
		try {
			// Validate PDF bytes before attempting to share
			if (!pdfBytes || pdfBytes.length === 0) {
				throw new Error("No hay datos de PDF para compartir");
			}

			// Sanitize filename for cross-platform compatibility
			const safeFilename = this.sanitizer(filename);
			const finalFilename = safeFilename || this.fallbackGenerator();

			// Create File directly - clean implementation
			const fileToShare = new File([new Uint8Array(pdfBytes)], finalFilename, {
				type: "application/pdf",
			});

			// CRITICAL: Validate File content is accessible BEFORE sharing
			// Android Chrome may fail to read File content even if File object seems valid
			const fileValid = await new Promise<boolean>((resolve) => {
				const reader = new FileReader();
				let resolved = false;
				let timeoutId: number | undefined;

				const cleanup = () => {
					if (timeoutId !== undefined) {
						clearTimeout(timeoutId);
					}
					resolved = true;
				};

				reader.onload = (e) => {
					if (resolved) return;
					cleanup();
					const result = e.target?.result;
					// Check if we can actually read the content
					resolve(result instanceof ArrayBuffer && result.byteLength > 0);
				};

				reader.onerror = () => {
					if (resolved) return;
					cleanup();
					logger.warn(
						"PDF File validation read failed before sharing - file invalidated",
					);
					resolve(false);
				};

				// Manual timeout handling since FileReader doesn't support native timeout
				timeoutId = globalThis.setTimeout(() => {
					if (resolved) return;
					cleanup();
					logger.warn("PDF File validation read timeout before sharing");
					reader.abort(); // Cancel the read operation
					resolve(false);
				}, 3000);

				try {
					// Try to read part of the file to validate content accessibility
					const testSlice = fileToShare.slice(
						0,
						Math.min(1024, pdfBytes.length),
					);
					reader.readAsArrayBuffer(testSlice);
				} catch (sliceError) {
					if (!resolved) {
						cleanup();
						logger.warn("File slice failed during validation", sliceError);
						resolve(false);
					}
				}
			});

			if (!fileValid) {
				throw new Error(
					"El PDF se generó correctamente pero se invalidó antes de compartir. " +
						"Esto ocurre cuando la aplicación deja de ser la principal (al ir a otra app). " +
						"Reinicie la aplicación, cárgue las imágenes nuevamente y genere un nuevo PDF.",
				);
			}

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
export async function generatePDF(
	images: ImageFile[],
	preset?: CompressionPreset,
): Promise<Uint8Array> {
	return pdfGenerator.generate(images, preset);
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
