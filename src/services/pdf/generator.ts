import type {
	PDFDocument as PDFDocumentType,
	PDFImage,
	PDFPage,
} from "pdf-lib";
import type { ImageFile, CompressionPreset } from "../../types/image";
import { COMPRESSION_PRESETS } from "../../types/image";
import { toEmbeddableImageBytes } from "../../lib/image/canvas-utils";
import { compressAllPdfImages } from "../../lib/pdf/pdf-compressor";
import { loadPdfDoc } from "../../lib/pdf/types";
import { MAX_PAGE_POINTS } from "../../config/limits";
import { logger } from "../logger";
import { storageService } from "../storage/storageService";

type PdfLib = typeof import("pdf-lib");

export class PdfGenerator {
	private pdfLib: PdfLib | null = null;
	// WeakMap<originalBytes, Map<preset, compressedBytes>>
	private readonly compressCache = new WeakMap<
		Uint8Array,
		Map<string, Uint8Array>
	>();

	private async getPdfLib(): Promise<PdfLib> {
		this.pdfLib ??= await import("pdf-lib");
		return this.pdfLib;
	}

	async generate(
		images: ImageFile[],
		preset?: CompressionPreset,
	): Promise<Uint8Array> {
		if (images.length === 0)
			throw new Error("No images provided for PDF generation");

		try {
			const pdfLib = await this.getPdfLib();
			const pdfDoc = await pdfLib.PDFDocument.create();
			const validImages = images.filter((img) => !img.error);

			const copiedPageCache = await this.preparePdfSources(
				pdfLib,
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
		pdfLib: PdfLib,
		pdfDoc: PDFDocumentType,
		images: ImageFile[],
		preset?: CompressionPreset,
	): Promise<Map<Uint8Array, Map<number, PDFPage>>> {
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
			let sourceBytesToLoad: Uint8Array;
			if (preset) {
				let presetCache = this.compressCache.get(pdfBytes);
				if (!presetCache) {
					presetCache = new Map();
					this.compressCache.set(pdfBytes, presetCache);
				}
				let compressed = presetCache.get(preset);
				if (!compressed) {
					compressed = await compressAllPdfImages(pdfLib, pdfBytes, {
						quality: COMPRESSION_PRESETS[preset].quality,
						mimeType: "image/jpeg",
					});
					presetCache.set(preset, compressed);
				}
				sourceBytesToLoad = compressed;
			} else {
				sourceBytesToLoad = pdfBytes;
			}

			const srcDoc = await loadPdfDoc(pdfLib, sourceBytesToLoad);
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
		const rawBytes = await this.resolveImageBytes(image);
		const { bytes: embedBytes, type: embedType } = await toEmbeddableImageBytes(
			rawBytes,
			image.file.type,
		);

		const embeddedImage: PDFImage =
			embedType === "image/jpeg"
				? await pdfDoc.embedJpg(embedBytes)
				: await pdfDoc.embedPng(embedBytes);

		const { width: imgW, height: imgH } = embeddedImage;
		// Scale pixel dimensions to PDF points capped at MAX_PAGE_POINTS
		const scale = Math.min(1, MAX_PAGE_POINTS / Math.max(imgW, imgH));
		const width = Math.round(imgW * scale);
		const height = Math.round(imgH * scale);
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

		if (image.file.size === 0) {
			throw new Error(
				`Archivo "${image.file.name}" inválido. Reinicie la aplicación y cargue las imágenes nuevamente.`,
			);
		}

		return new Uint8Array(await image.file.arrayBuffer());
	}
}
