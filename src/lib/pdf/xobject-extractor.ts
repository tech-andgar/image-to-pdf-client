import { PDFName, PDFDict, PDFRawStream, type PDFPage } from "pdf-lib";
import type { PdfXObject } from "./types";

function getFilterName(streamDict: PDFDict): string | null {
	const filter = streamDict.get(PDFName.of("Filter"));
	if (!filter) return null;
	// Filter can be a name or array — take first
	const str = filter.toString();
	const match = str.match(
		/\/(DCTDecode|JPXDecode|FlateDecode|LZWDecode|CCITTFaxDecode)/,
	);
	return match ? match[1] : null;
}

export function extractImageXObjects(page: PDFPage): PdfXObject[] {
	const results: PdfXObject[] = [];

	const resources = page.node.Resources();
	if (!resources) return results;

	const xObjects = resources.lookup(PDFName.of("XObject"), PDFDict);
	if (!xObjects) return results;

	for (const [key, ref] of xObjects.entries()) {
		const xobj = page.doc.context.lookup(ref);
		if (!(xobj instanceof PDFRawStream)) continue;

		const dict = xobj.dict;
		const subtype = dict.get(PDFName.of("Subtype"));
		if (subtype?.toString() !== "/Image") continue;

		const widthObj = dict.get(PDFName.of("Width"));
		const heightObj = dict.get(PDFName.of("Height"));
		if (!widthObj || !heightObj) continue;

		const width = Number(widthObj.toString());
		const height = Number(heightObj.toString());
		const filterName = getFilterName(dict);
		// Use raw stream bytes directly — DCT/JPX are already encoded image data, no decode needed
		const rawBytes = xobj.contents;

		results.push({ name: key.toString(), width, height, filterName, rawBytes });
	}

	return results;
}
