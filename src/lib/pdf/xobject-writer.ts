import type { PDFRawStream, PDFDocument, PDFRef } from "pdf-lib";
import type { CompressedXObject } from "./types";

type PdfLib = typeof import("pdf-lib");

export async function writeCompressedXObject(
	pdfLib: PdfLib,
	pdfDoc: PDFDocument,
	ref: PDFRef,
	result: CompressedXObject,
	originalStream: PDFRawStream,
): Promise<boolean> {
	if (result.bytes.length >= originalStream.contents.length) {
		return false;
	}

	const { PDFName } = pdfLib;
	const dict = originalStream.dict;
	type LiteralDict = Parameters<typeof pdfDoc.context.stream>[1];

	// Build dict omitting undefined entries — pdf-lib throws on undefined values
	const entries: Record<string, unknown> = {
		Type: "XObject",
		Subtype: "Image",
		Width: result.width,
		Height: result.height,
		Filter: PDFName.of("DCTDecode"),
	};

	const colorSpace = dict.get(PDFName.of("ColorSpace"));
	if (colorSpace !== undefined) entries.ColorSpace = colorSpace;

	const bitsPerComponent = dict.get(PDFName.of("BitsPerComponent"));
	if (bitsPerComponent !== undefined)
		entries.BitsPerComponent = bitsPerComponent;

	const sMaskRef = dict.get(PDFName.of("SMask"));
	if (sMaskRef !== undefined) entries.SMask = sMaskRef;

	const maskRef = dict.get(PDFName.of("Mask"));
	if (maskRef !== undefined) entries.Mask = maskRef;

	pdfDoc.context.assign(
		ref,
		pdfDoc.context.stream(result.bytes, entries as LiteralDict),
	);
	return true;
}
