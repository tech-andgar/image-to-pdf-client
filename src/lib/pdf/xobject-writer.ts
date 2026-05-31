import {
	PDFName,
	type PDFRawStream,
	type PDFDocument,
	type PDFRef,
} from "pdf-lib";
import { deflate } from "fflate";
import type { CompressedXObject } from "./types";

function deflateAsync(data: Uint8Array): Promise<Uint8Array> {
	return new Promise((resolve, reject) =>
		deflate(data, (err, result) => (err ? reject(err) : resolve(result))),
	);
}

/**
 * Writes a CompressedXObject back into the PDFDocument context,
 * optionally creating a new SMask stream for transparency.
 * Returns false if the compressed bytes are not smaller than the original.
 */
export async function writeCompressedXObject(
	pdfDoc: PDFDocument,
	ref: PDFRef,
	result: CompressedXObject,
	originalStream: PDFRawStream,
): Promise<boolean> {
	if (result.bytes.length >= originalStream.contents.length) {
		return false;
	}

	const dict = originalStream.dict;
	type LiteralDict = Parameters<typeof pdfDoc.context.stream>[1];

	const streamDict = {
		Type: "XObject",
		Subtype: "Image",
		Width: result.width,
		Height: result.height,
		ColorSpace: dict.get(PDFName.of("ColorSpace")),
		BitsPerComponent: dict.get(PDFName.of("BitsPerComponent")),
		Filter: PDFName.of("DCTDecode"),
	} as LiteralDict;

	// Preserve original SMask/Mask refs — the existing alpha mask is correct; don't replace it
	const sMaskRef = dict.get(PDFName.of("SMask"));
	const maskRef = dict.get(PDFName.of("Mask"));
	if (sMaskRef) (streamDict as Record<string, unknown>).SMask = sMaskRef;
	if (maskRef) (streamDict as Record<string, unknown>).Mask = maskRef;

	pdfDoc.context.assign(ref, pdfDoc.context.stream(result.bytes, streamDict));
	return true;
}
