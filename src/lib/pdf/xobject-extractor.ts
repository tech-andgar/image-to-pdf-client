import type { PDFDict, PDFRawStream, PDFPage } from "pdf-lib";
import type { PdfXObject } from "./types";

type PdfLib = typeof import("pdf-lib");

const FILTER_RE =
	/\/(DCTDecode|JPXDecode|FlateDecode|LZWDecode|CCITTFaxDecode)/;

function getFilterName(pdfLib: PdfLib, streamDict: PDFDict): string | null {
	const filter = streamDict.get(pdfLib.PDFName.of("Filter"));
	if (!filter) return null;
	const match = filter.toString().match(FILTER_RE);
	return match ? match[1] : null;
}

export function buildPdfXObjectFromStream(
	pdfLib: PdfLib,
	stream: PDFRawStream,
	name: string,
): PdfXObject | null {
	const { PDFName, decodePDFRawStream } = pdfLib;
	const dict = stream.dict;
	if (dict.get(PDFName.of("Subtype"))?.toString() !== "/Image") return null;

	const widthObj = dict.get(PDFName.of("Width"));
	const heightObj = dict.get(PDFName.of("Height"));
	if (!widthObj || !heightObj) return null;

	const filterName = getFilterName(pdfLib, dict);
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

export function extractImageXObjects(
	pdfLib: PdfLib,
	page: PDFPage,
): PdfXObject[] {
	const { PDFName, PDFDict, PDFRawStream } = pdfLib;
	const results: PdfXObject[] = [];

	const resources = page.node.Resources();
	if (!resources) return results;

	const xObjects = resources.lookup(PDFName.of("XObject"), PDFDict);
	if (!xObjects) return results;

	for (const [key, ref] of xObjects.entries()) {
		const stream = page.doc.context.lookup(ref);
		if (!(stream instanceof PDFRawStream)) continue;

		const name = key.toString().replace(/^\//, "");
		const xobj = buildPdfXObjectFromStream(pdfLib, stream, name);
		if (xobj) results.push(xobj);
	}

	return results;
}
