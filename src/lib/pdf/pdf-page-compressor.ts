import {
	PDFDocument,
	PDFName,
	PDFDict,
	PDFRawStream,
	type PDFRef,
} from "pdf-lib";
import { deflate } from "fflate";
import type { CompressOptions } from "./types";
import { extractImageXObjects } from "./xobject-extractor";
import { compressXObject } from "./xobject-compressor";
import { logger } from "../../services/logger";

/**
 * Compresses all embedded image XObjects in a PDF document in a single pass.
 * Each unique XObject ref is compressed only once — shared images across pages stay shared.
 * Returns modified PDF bytes.
 */
export async function compressAllPdfImages(
	pdfBytes: Uint8Array,
	options: CompressOptions,
): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.load(pdfBytes);
	const pages = pdfDoc.getPages();

	// Collect unique XObject refs across all pages to avoid recompressing shared images
	const refToName = new Map<PDFRef, string>();
	for (const page of pages) {
		const resources = page.node.Resources();
		if (!resources) continue;
		const xObjectDict = resources.lookup(PDFName.of("XObject"), PDFDict);
		if (!xObjectDict) continue;
		for (const [key, ref] of xObjectDict.entries()) {
			if (!refToName.has(ref as PDFRef)) {
				refToName.set(ref as PDFRef, key.toString().replace(/^\//, ""));
			}
		}
	}

	// Extract and compress each unique XObject
	let replaced = 0;
	let skipped = 0;
	let masked = 0;

	for (const [ref, name] of refToName.entries()) {
		const streamObj = pdfDoc.context.lookup(ref);
		if (!(streamObj instanceof PDFRawStream)) continue;

		const dict = streamObj.dict;
		const subtype = dict.get(PDFName.of("Subtype"));
		if (subtype?.toString() !== "/Image") continue;

		const widthObj = dict.get(PDFName.of("Width"));
		const heightObj = dict.get(PDFName.of("Height"));
		if (!widthObj || !heightObj) continue;

		// Build a temporary PdfXObject to reuse existing decoder/compressor logic
		const { decodePDFRawStream } = await import("pdf-lib");
		const filterMatch = dict
			.get(PDFName.of("Filter"))
			?.toString()
			.match(/\/(DCTDecode|JPXDecode|FlateDecode|LZWDecode|CCITTFaxDecode)/);
		const filterName = filterMatch ? filterMatch[1] : null;

		const hasMask =
			dict.get(PDFName.of("SMask")) != null ||
			dict.get(PDFName.of("Mask")) != null;

		if (hasMask) {
			masked++;
		}

		const rawBytes =
			filterName === "DCTDecode" || filterName === "JPXDecode"
				? streamObj.contents
				: decodePDFRawStream(streamObj).decode();

		const xobj = {
			name,
			width: Number(widthObj.toString()),
			height: Number(heightObj.toString()),
			filterName,
			rawBytes,
			hasMask,
		};

		const result = await compressXObject(xobj, options);
		if (!result) continue;

		if (result.bytes.length >= streamObj.contents.length) {
			logger.info(
				`[pdf-compressor] skip ${name}: ${result.bytes.length}B >= original ${streamObj.contents.length}B`,
			);
			skipped++;
			continue;
		}

		const streamDict: Record<string, unknown> = {
			Type: "XObject",
			Subtype: "Image",
			Width: result.width,
			Height: result.height,
			ColorSpace: dict.get(PDFName.of("ColorSpace")),
			BitsPerComponent: dict.get(PDFName.of("BitsPerComponent")),
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
			streamDict.SMask = pdfDoc.context.register(maskStream);
		}

		pdfDoc.context.assign(ref, pdfDoc.context.stream(result.bytes, streamDict));
		logger.info(
			`[pdf-compressor] replaced ${name}: ${result.width}x${result.height}, ${streamObj.contents.length}B → ${result.bytes.length}B`,
		);
		replaced++;
	}

	logger.info(
		`[pdf-compressor] done: ${replaced} replaced, ${skipped} skipped (already small), ${masked} with alpha`,
	);

	return pdfDoc.save();
}

/**
 * @deprecated Use compressAllPdfImages — processes entire PDF in one pass to preserve shared XObjects.
 * Kept for reference only.
 */
export async function compressPdfPageImages(
	pdfBytes: Uint8Array,
	pageIndex: number,
	options: CompressOptions,
): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.load(pdfBytes);
	const page = pdfDoc.getPage(pageIndex);
	const imageObjects = extractImageXObjects(page);

	if (imageObjects.length === 0) return pdfBytes;

	const compressed = await Promise.all(
		imageObjects.map((img) => compressXObject(img, options)),
	);

	const resources = page.node.Resources();
	if (!resources) return pdfDoc.save();
	const xObjectDict = resources.lookup(PDFName.of("XObject"), PDFDict);
	if (!xObjectDict) return pdfDoc.save();

	for (const result of compressed) {
		if (!result) continue;
		const ref = xObjectDict.get(PDFName.of(result.name));
		if (!ref) continue;
		const streamObj = pdfDoc.context.lookup(ref);
		if (!(streamObj instanceof PDFRawStream)) continue;
		if (result.bytes.length >= streamObj.contents.length) continue;

		pdfDoc.context.assign(
			ref as PDFRef,
			pdfDoc.context.stream(result.bytes, {
				Type: "XObject" as unknown as import("pdf-lib").PDFObject,
				Subtype: "Image" as unknown as import("pdf-lib").PDFObject,
				Width: result.width as unknown as import("pdf-lib").PDFObject,
				Height: result.height as unknown as import("pdf-lib").PDFObject,
				ColorSpace: streamObj.dict.get(PDFName.of("ColorSpace")),
				BitsPerComponent: streamObj.dict.get(PDFName.of("BitsPerComponent")),
				Filter: PDFName.of("DCTDecode"),
			} as Parameters<typeof pdfDoc.context.stream>[1]),
		);
	}

	return pdfDoc.save();
}
