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

	const streamDict = {
		Type: "XObject",
		Subtype: "Image",
		Width: result.width,
		Height: result.height,
		ColorSpace: dict.get(PDFName.of("ColorSpace")),
		BitsPerComponent: dict.get(PDFName.of("BitsPerComponent")),
		Filter: PDFName.of("DCTDecode"),
	} as LiteralDict;

	const sMaskRef = dict.get(PDFName.of("SMask"));
	const maskRef = dict.get(PDFName.of("Mask"));
	if (sMaskRef) (streamDict as Record<string, unknown>).SMask = sMaskRef;
	if (maskRef) (streamDict as Record<string, unknown>).Mask = maskRef;

	pdfDoc.context.assign(ref, pdfDoc.context.stream(result.bytes, streamDict));
	return true;
}
