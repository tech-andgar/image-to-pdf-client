import type {
	PDFDocument as PDFDocumentType,
	PDFImage,
	PDFPage,
} from "pdf-lib";
import type { ImageFile, CompressionPreset } from "../../types/image";
import { COMPRESSION_PRESETS } from "../../types/image";
import { clampDimensions, DEFAULT_JPEG_QUALITY } from "../../config/limits";
import {
	loadImageFromUrl,
	blobToUint8Array,
} from "../../lib/image/canvas-utils";
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

			const copiedPageCache = await this.preparePdfSources(
				pdfDoc,
				validImages,
				preset,
			);

			for (const image of validImages) {
				if (image.pdfSource) {
					this.addCopiedPage(pdfDoc, image, copiedPageCache);
					continue;
				}
				await this.addImagePage(pdfDoc, image);
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

	private async preparePdfSources(
		pdfDoc: PDFDocumentType,
		images: ImageFile[],
		preset?: CompressionPreset,
	): Promise<Map<Uint8Array, Map<number, PDFPage>>> {
		const { PDFDocument } = await import("pdf-lib");
		const copiedPageCache = new Map<Uint8Array, Map<number, PDFPage>>();

		const sourcePageIndices = new Map<Uint8Array, Set<number>>();
		for (const image of images) {
			if (!image.pdfSource) continue;
			const { pdfBytes, pageIndex } = image.pdfSource;
			if (!sourcePageIndices.has(pdfBytes))
				sourcePageIndices.set(pdfBytes, new Set());
			sourcePageIndices.get(pdfBytes)?.add(pageIndex);
		}

		for (const [pdfBytes, pageIndices] of sourcePageIndices.entries()) {
			const sourceBytesToLoad = preset
				? await compressAllPdfImages(pdfBytes, {
						quality: COMPRESSION_PRESETS[preset].quality,
						mimeType: "image/jpeg",
					})
				: pdfBytes;

			const srcDoc = await PDFDocument.load(sourceBytesToLoad);
			const indices = Array.from(pageIndices);
			const copiedPages = await pdfDoc.copyPages(srcDoc, indices);

			const pageMap = new Map<number, PDFPage>();
			for (let i = 0; i < indices.length; i++)
				pageMap.set(indices[i], copiedPages[i]);
			copiedPageCache.set(pdfBytes, pageMap);

			logger.info(
				`[pdf-generator] batch-copied ${indices.length} pages, preset=${preset ?? "none"}`,
			);
		}

		return copiedPageCache;
	}

	private addCopiedPage(
		pdfDoc: PDFDocumentType,
		image: ImageFile,
		cache: Map<Uint8Array, Map<number, PDFPage>>,
	): void {
		if (!image.pdfSource) return;
		const { pdfBytes, pageIndex } = image.pdfSource;
		const page = cache.get(pdfBytes)?.get(pageIndex);
		if (page) pdfDoc.addPage(page);
	}

	private async addImagePage(
		pdfDoc: PDFDocumentType,
		image: ImageFile,
	): Promise<void> {
		const imageBytes = await this.resolveImageBytes(image);
		const { bytes: embedBytes, type: embedType } =
			await this.ensureEmbeddableFormat(imageBytes, image.file.type);

		let embeddedImage: PDFImage;
		if (embedType === "image/jpeg") {
			embeddedImage = await pdfDoc.embedJpg(embedBytes);
		} else {
			embeddedImage = await pdfDoc.embedPng(embedBytes);
		}

		const { width, height } = embeddedImage;
		const page = pdfDoc.addPage([width, height]);
		page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
	}

	private async resolveImageBytes(image: ImageFile): Promise<Uint8Array> {
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

		if (!(await this.isFileAccessible(image.file))) {
			throw new Error(
				`Archivo "${image.file.name}" inválido. Reinicie la aplicación y cargue las imágenes nuevamente.`,
			);
		}

		return new Uint8Array(await image.file.arrayBuffer());
	}

	private async ensureEmbeddableFormat(
		bytes: Uint8Array,
		mimeType: string,
	): Promise<{ bytes: Uint8Array; type: string }> {
		if (
			mimeType === "image/jpeg" ||
			mimeType === "image/jpg" ||
			mimeType === "image/png"
		) {
			return {
				bytes,
				type: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
			};
		}

		const blobUrl = URL.createObjectURL(
			new Blob([bytes.buffer as ArrayBuffer], { type: mimeType }),
		);
		try {
			const img = await loadImageFromUrl(blobUrl);
			const { width, height } = clampDimensions(
				img.naturalWidth,
				img.naturalHeight,
			);

			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("No canvas context");
			ctx.drawImage(img, 0, 0, width, height);

			const blob = await new Promise<Blob>((resolve, reject) =>
				canvas.toBlob(
					(b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
					"image/jpeg",
					DEFAULT_JPEG_QUALITY,
				),
			);
			return { bytes: await blobToUint8Array(blob), type: "image/jpeg" };
		} finally {
			URL.revokeObjectURL(blobUrl);
		}
	}

	private async isFileAccessible(file: File): Promise<boolean> {
		try {
			return file.size !== undefined && file.size >= 0;
		} catch {
			return false;
		}
	}
}
