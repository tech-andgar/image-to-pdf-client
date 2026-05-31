import { PDFDocument, PDFName, PDFDict, PDFRawStream } from "pdf-lib";
import { deflate } from "fflate";
import type { CompressOptions } from "./types";
import { extractImageXObjects } from "./xobject-extractor";
import { compressXObject } from "./xobject-compressor";
import { logger } from "../../services/logger";

/**
 * Compresses embedded images on a single PDF page while preserving vector text/graphics.
 * Returns modified PDF bytes, or the original if nothing was compressible.
 */
export async function compressPdfPageImages(
	pdfBytes: Uint8Array,
	pageIndex: number,
	options: CompressOptions,
): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.load(pdfBytes);
	const page = pdfDoc.getPage(pageIndex);
	const imageObjects = extractImageXObjects(page);

	const maskedCount = imageObjects.filter((img) => img.hasMask).length;
	logger.info(
		`[pdf-compressor] page ${pageIndex}: found ${imageObjects.length} image XObjects (${maskedCount} with mask/alpha, skipped), quality=${options.quality}`,
	);

	if (imageObjects.length === 0) {
		logger.info(
			`[pdf-compressor] page ${pageIndex}: no raster images — preset has no effect`,
		);
		return pdfBytes;
	}

	const compressed = await Promise.all(
		imageObjects.map((img) => compressXObject(img, options)),
	);

	const successCount = compressed.filter(Boolean).length;
	logger.info(
		`[pdf-compressor] page ${pageIndex}: compressed ${successCount}/${imageObjects.length} images`,
	);

	const resources = page.node.Resources();
	if (!resources) return pdfDoc.save();

	const xObjectDict = resources.lookup(PDFName.of("XObject"), PDFDict);
	if (!xObjectDict) return pdfDoc.save();

	for (const result of compressed) {
		if (!result) continue;

		// result.name already has "/" prefix from PDFName.toString() — look up directly
		const ref = xObjectDict.get(PDFName.of(result.name));
		if (!ref) {
			logger.info(`[pdf-compressor] ref not found for ${result.name}`);
			continue;
		}

		const streamObj = pdfDoc.context.lookup(ref);
		if (!(streamObj instanceof PDFRawStream)) continue;

		const streamDict: Record<string, unknown> = {
			Type: "XObject",
			Subtype: "Image",
			Width: result.width,
			Height: result.height,
			ColorSpace: streamObj.dict.get(PDFName.of("ColorSpace")),
			BitsPerComponent: streamObj.dict.get(PDFName.of("BitsPerComponent")),
			Filter: PDFName.of("DCTDecode"),
		};

		if (result.alphaMask) {
			const compressedAlpha = await new Promise<Uint8Array>((resolve, reject) =>
				deflate(result.alphaMask as Uint8Array, (err, data) =>
					err ? reject(err) : resolve(data),
				),
			);
			const maskStream = pdfDoc.context.stream(compressedAlpha, {
				Type: "XObject",
				Subtype: "Image",
				Width: result.width,
				Height: result.height,
				ColorSpace: PDFName.of("DeviceGray"),
				BitsPerComponent: 8,
				Filter: PDFName.of("FlateDecode"),
			});
			const maskRef = pdfDoc.context.register(maskStream);
			streamDict.SMask = maskRef;
		}

		const newStream = pdfDoc.context.stream(result.bytes, streamDict);

		logger.info(
			`[pdf-compressor] replaced ${result.name}: ${result.width}x${result.height}`,
		);

		pdfDoc.context.assign(
			ref as Parameters<typeof pdfDoc.context.assign>[0],
			newStream,
		);
	}

	return pdfDoc.save();
}
