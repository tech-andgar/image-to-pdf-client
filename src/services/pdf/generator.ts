import type { PDFImage } from "pdf-lib";
import type { ImageFile, CompressionPreset } from "../../types/image";
import { COMPRESSION_PRESETS } from "../../types/image";
import { compressAllPdfImages } from "../../lib/pdf/pdf-compressor";
import { logger } from "../logger";
import { storageService } from "../storageService";

export class PdfGenerator {
	async generate(
		images: ImageFile[],
		preset?: CompressionPreset,
	): Promise<Uint8Array> {
		if (images.length === 0)
			throw new Error("No images provided for PDF generation");

		try {
			const { PDFDocument } = await import("pdf-lib");
			const pdfDoc = await PDFDocument.create();

			const validImages = images.filter((img) => !img.error);

			// Pre-pass: compress each unique PDF source once, batch-copy all pages per source
			const compressedSourceCache = new Map<Uint8Array, Uint8Array>();
			const parsedSourceCache = new Map<
				Uint8Array,
				Awaited<ReturnType<typeof PDFDocument.load>>
			>();
			const copiedPageCache = new Map<
				Uint8Array,
				Map<number, import("pdf-lib").PDFPage>
			>();

			const sourcePageIndices = new Map<Uint8Array, Set<number>>();
			for (const image of validImages) {
				if (!image.pdfSource) continue;
				const { pdfBytes, pageIndex } = image.pdfSource;
				if (!sourcePageIndices.has(pdfBytes))
					sourcePageIndices.set(pdfBytes, new Set());
				sourcePageIndices.get(pdfBytes)?.add(pageIndex);
			}

			for (const [pdfBytes, pageIndices] of sourcePageIndices.entries()) {
				let sourceBytesToLoad = pdfBytes;
				if (preset) {
					let compressed = compressedSourceCache.get(pdfBytes);
					if (!compressed) {
						compressed = await compressAllPdfImages(pdfBytes, {
							quality: COMPRESSION_PRESETS[preset].quality,
							mimeType: "image/jpeg",
						});
						compressedSourceCache.set(pdfBytes, compressed);
					}
					sourceBytesToLoad = compressed;
				}

				let srcDoc = parsedSourceCache.get(sourceBytesToLoad);
				if (!srcDoc) {
					srcDoc = await PDFDocument.load(sourceBytesToLoad);
					parsedSourceCache.set(sourceBytesToLoad, srcDoc);
				}

				const indices = Array.from(pageIndices);
				const copiedPages = await pdfDoc.copyPages(srcDoc, indices);
				const pageMap = new Map<number, import("pdf-lib").PDFPage>();
				for (let i = 0; i < indices.length; i++)
					pageMap.set(indices[i], copiedPages[i]);
				copiedPageCache.set(pdfBytes, pageMap);
				logger.info(
					`[pdf-generator] batch-copied ${indices.length} pages, preset=${preset ?? "none"}`,
				);
			}

			for (const image of validImages) {
				if (image.pdfSource) {
					const { pdfBytes, pageIndex } = image.pdfSource;
					const page = copiedPageCache.get(pdfBytes)?.get(pageIndex);
					if (page) pdfDoc.addPage(page);
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
						imageBytes = await this.fileToUint8Array(image.file);
					} else {
						throw error;
					}
				}

				let embedBytes = imageBytes;
				let embedType = image.file.type;

				if (
					embedType !== "image/jpeg" &&
					embedType !== "image/jpg" &&
					embedType !== "image/png"
				) {
					embedBytes = await this.convertToJpeg(embedBytes, embedType);
					embedType = "image/jpeg";
				}

				let embeddedImage: PDFImage;
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

			if (pdfDoc.getPageCount() === 0)
				throw new Error("No valid images to include in PDF");
			return await pdfDoc.save();
		} catch (error) {
			logger.error("Error generating PDF", error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to generate PDF",
			);
		}
	}

	private async validateFile(file: File): Promise<boolean> {
		try {
			return file.size !== undefined && file.size >= 0;
		} catch {
			return false;
		}
	}

	private async getImageData(image: ImageFile): Promise<Uint8Array> {
		if (image.storageId) {
			try {
				const blob = await storageService.getImage(image.storageId);
				if (blob) return new Uint8Array(await blob.arrayBuffer());
				logger.warn(
					`Image not found in storage: ${image.storageId}, falling back to File`,
				);
			} catch (err) {
				logger.warn("Error reading from storage", err);
			}
		}
		return this.fileToUint8Array(image.file);
	}

	private async fileToUint8Array(file: File | Blob): Promise<Uint8Array> {
		return new Uint8Array(await file.arrayBuffer());
	}

	private async convertToJpeg(
		bytes: Uint8Array,
		mimeType: string,
	): Promise<Uint8Array> {
		const MAX_PIXELS = 16_777_216;
		const blobUrl = URL.createObjectURL(
			new Blob([bytes.buffer as ArrayBuffer], { type: mimeType }),
		);
		try {
			return await new Promise<Uint8Array>((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					let { naturalWidth: w, naturalHeight: h } = img;
					if (w * h > MAX_PIXELS) {
						const scale = Math.sqrt(MAX_PIXELS / (w * h));
						w = Math.round(w * scale);
						h = Math.round(h * scale);
					}
					const canvas = document.createElement("canvas");
					canvas.width = w;
					canvas.height = h;
					const ctx = canvas.getContext("2d");
					if (!ctx) return reject(new Error("No canvas context"));
					ctx.drawImage(img, 0, 0, w, h);
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
	}
}
