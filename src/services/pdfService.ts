import { PDFDocument } from "pdf-lib";
import type { PDFImage } from "pdf-lib";
import type { ImageFile } from "../types/image";
import { logger } from "./logger";

/**
 * Represents the share capabilities of the current browser
 */
interface ShareCapabilities {
	canShare: boolean;
	canShareFile: boolean;
	supportsWebShare: boolean;
}

/**
 * Checks Web Share API availability and capabilities
 */
function getShareCapabilities(pdfBlob: Blob): ShareCapabilities {
	if (!navigator.share) {
		return { canShare: false, canShareFile: false, supportsWebShare: false };
	}

	const supportsWebShare = true;

	// Check if we can share files directly (Web Share Level 2)
	let canShareFile = false;
	try {
		// Use type assertion for canShare method if available
		const shareApi = navigator.share as {
			canShare?: (data: unknown) => boolean;
		};
		canShareFile =
			"canShare" in shareApi &&
			typeof shareApi.canShare === "function" &&
			shareApi.canShare({
				files: [new File([pdfBlob], "temp.pdf", { type: "application/pdf" })],
			});
	} catch (fileShareError) {
		// Log the file sharing check error for debugging
		logger.warn("Failed to check file sharing capabilities", fileShareError);
		canShareFile = false;
	}

	// Check basic sharing capability
	let canShare = canShareFile;
	try {
		const shareApi = navigator.share as {
			canShare?: (data: unknown) => boolean;
		};
		if ("canShare" in shareApi && typeof shareApi.canShare === "function") {
			canShare = canShare || shareApi.canShare({ url: window.location.href });
		} else {
			canShare = true; // Assume basic sharing is available if navigator.share exists
		}
	} catch (shareError) {
		// Log the share capability check error for debugging
		logger.warn("Failed to check share capabilities", shareError);
		canShare = true;
	}

	return { canShare, canShareFile, supportsWebShare };
}

/**
 * Shares PDF using Web Share API or fallback to clipboard/copy instructions
 */
export async function sharePDF(
	pdfBytes: Uint8Array,
	filename: string = "images.pdf",
): Promise<{ success: boolean; method: string; error?: string }> {
	try {
		// Create a new ArrayBuffer from the Uint8Array bytes to ensure compatibility
		const pdfArrayBuffer = new ArrayBuffer(pdfBytes.length);
		const view = new Uint8Array(pdfArrayBuffer);
		view.set(pdfBytes);

		const pdfBlob = new Blob([pdfArrayBuffer], {
			type: "application/pdf",
		});
		const capabilities = getShareCapabilities(pdfBlob);

		if (!capabilities.canShare) {
			// Fallback: Copy URL to clipboard as it's the most basic sharing method
			try {
				const url = window.location.href;
				await navigator.clipboard.writeText(url);
				return {
					success: true,
					method: "clipboard-url",
					error:
						"Tu navegador no soporta compartir archivos. Se copió la URL de esta aplicación al portapapeles para que puedas compartirla manualmente.",
				};
			} catch (clipboardError) {
				// Log the clipboard error for debugging
				logger.warn("Failed to copy to clipboard", clipboardError);
				return {
					success: false,
					method: "none",
					error:
						"No se puede compartir desde este navegador. Te recomendamos usar las opciones de descarga para guardar el PDF localmente.",
				};
			}
		}

		// Try to share with file if supported
		if (capabilities.canShareFile) {
			await navigator.share({
				files: [new File([pdfBlob], filename, { type: "application/pdf" })],
				title: filename,
				text: "PDF generado con imágenes convertidas",
			});
			return { success: true, method: "file" };
		}

		// Fallback to URL sharing
		await navigator.share({
			title: filename,
			text: "PDF generado con imágenes convertidas",
			url: window.location.href,
		});
		return { success: true, method: "url" };
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

/**
 * Converts a File to a Uint8Array for pdf-lib
 */
async function fileToUint8Array(file: File): Promise<Uint8Array> {
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

/**
 * Generates a PDF from an array of ImageFiles in the specified order
 */
export async function generatePDF(images: ImageFile[]): Promise<Uint8Array> {
	if (images.length === 0) {
		throw new Error("No images provided for PDF generation");
	}

	try {
		const pdfDoc = await PDFDocument.create();

		for (const image of images) {
			if (image.error) {
				logger.warn("Skipping invalid image", { error: image.error });
				continue;
			}

			const imageBytes = await fileToUint8Array(image.file);
			let embeddedImage: PDFImage;

			// Embed image based on type
			if (image.file.type === "image/jpeg" || image.file.type === "image/jpg") {
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

/**
 * Downloads the PDF with the given filename
 */
export function downloadPDF(
	pdfBytes: Uint8Array,
	filename: string = "images.pdf",
): void {
	try {
		// Create a new ArrayBuffer from the Uint8Array bytes to ensure compatibility
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

		// Clean up the blob URL
		setTimeout(() => URL.revokeObjectURL(url), 100);
	} catch (error) {
		logger.error("Error downloading PDF", error);
		throw new Error("Failed to download PDF");
	}
}
