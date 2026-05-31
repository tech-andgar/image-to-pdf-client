import { PDFDocument, PDFName, PDFDict, PDFRawStream } from "pdf-lib";
import type { CompressOptions } from "./types";
import { extractImageXObjects } from "./xobject-extractor";
import { compressXObject } from "./xobject-compressor";

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
	const xobjects = extractImageXObjects(page);

	if (xobjects.length === 0) return pdfBytes;

	const compressed = await Promise.all(
		xobjects.map((xobj) => compressXObject(xobj, options)),
	);

	const resources = page.node.Resources();
	if (!resources) return pdfDoc.save();

	const xObjectDict = resources.lookup(PDFName.of("XObject"), PDFDict);
	if (!xObjectDict) return pdfDoc.save();

	for (const result of compressed) {
		if (!result) continue;

		const ref = xObjectDict.get(PDFName.of(result.name));
		if (!ref) continue;

		const xobj = pdfDoc.context.lookup(ref);
		if (!(xobj instanceof PDFRawStream)) continue;

		const newBytes = result.bytes;
		// Replace stream content and update dictionary entries
		const newStream = pdfDoc.context.stream(newBytes, {
			Type: "XObject",
			Subtype: "Image",
			Width: result.width,
			Height: result.height,
			ColorSpace: xobj.dict.get(PDFName.of("ColorSpace")),
			BitsPerComponent: xobj.dict.get(PDFName.of("BitsPerComponent")),
			Filter: PDFName.of("DCTDecode"),
		});

		// Remap the reference to the new stream
		pdfDoc.context.assign(
			ref as Parameters<typeof pdfDoc.context.assign>[0],
			newStream,
		);
	}

	return pdfDoc.save();
}
