import {
	PDFName,
	PDFDict,
	PDFRawStream,
	decodePDFRawStream,
	type PDFPage,
} from "pdf-lib";
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
		// DCT/JPX: contents are already encoded image bytes (JPEG/JPEG2000) — use directly
		// FlateDecode/raw: contents are zlib-compressed pixels — decode to raw pixel bytes
		const rawBytes =
			filterName === "DCTDecode" || filterName === "JPXDecode"
				? xobj.contents
				: decodePDFRawStream(xobj).decode();

		const hasMask =
			dict.get(PDFName.of("SMask")) != null ||
			dict.get(PDFName.of("Mask")) != null;

		// key.toString() returns "/Name" — strip leading slash for consistent lookup
		results.push({
			name: key.toString().replace(/^\//, ""),
			width,
			height,
			filterName,
			rawBytes,
			hasMask,
		});
	}

	return results;
}
