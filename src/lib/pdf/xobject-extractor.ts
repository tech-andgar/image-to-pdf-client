import {
	PDFName,
	PDFDict,
	PDFRawStream,
	decodePDFRawStream,
	type PDFPage,
} from "pdf-lib";
import type { PdfXObject } from "./types";

const FILTER_RE =
	/\/(DCTDecode|JPXDecode|FlateDecode|LZWDecode|CCITTFaxDecode)/;

function getFilterName(streamDict: PDFDict): string | null {
	const filter = streamDict.get(PDFName.of("Filter"));
	if (!filter) return null;
	const match = filter.toString().match(FILTER_RE);
	return match ? match[1] : null;
}

/**
 * Builds a PdfXObject from a raw PDF stream.
 * Returns null if the stream is not a supported image XObject.
 */
export function buildPdfXObjectFromStream(
	stream: PDFRawStream,
	name: string,
): PdfXObject | null {
	const dict = stream.dict;
	if (dict.get(PDFName.of("Subtype"))?.toString() !== "/Image") return null;

	const widthObj = dict.get(PDFName.of("Width"));
	const heightObj = dict.get(PDFName.of("Height"));
	if (!widthObj || !heightObj) return null;

	const filterName = getFilterName(dict);
	// DCT/JPX: contents are already encoded image bytes — use directly
	// FlateDecode/raw: zlib-compressed pixels — decode to raw pixel bytes
	const rawBytes =
		filterName === "DCTDecode" || filterName === "JPXDecode"
			? stream.contents
			: decodePDFRawStream(stream).decode();

	const hasMask =
		dict.get(PDFName.of("SMask")) != null ||
		dict.get(PDFName.of("Mask")) != null;

	return {
		name,
		width: Number(widthObj.toString()),
		height: Number(heightObj.toString()),
		filterName,
		rawBytes,
		hasMask,
	};
}

export function extractImageXObjects(page: PDFPage): PdfXObject[] {
	const results: PdfXObject[] = [];

	const resources = page.node.Resources();
	if (!resources) return results;

	const xObjects = resources.lookup(PDFName.of("XObject"), PDFDict);
	if (!xObjects) return results;

	for (const [key, ref] of xObjects.entries()) {
		const stream = page.doc.context.lookup(ref);
		if (!(stream instanceof PDFRawStream)) continue;

		// key.toString() returns "/Name" — strip leading slash for consistent lookup
		const name = key.toString().replace(/^\//, "");
		const xobj = buildPdfXObjectFromStream(stream, name);
		if (xobj) results.push(xobj);
	}

	return results;
}
