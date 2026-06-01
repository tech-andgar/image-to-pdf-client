import type { PDFDocument, PDFRef } from "pdf-lib";
import type { CompressOptions } from "./types";
import { buildPdfXObjectFromStream } from "./xobject-extractor";
import { compressXObject } from "./xobject-compressor";
import { writeCompressedXObject } from "./xobject-writer";
import { logger } from "../../services/logger";

type PdfLib = typeof import("pdf-lib");

export async function compressAllPdfImages(
	pdfLib: PdfLib,
	pdfBytes: Uint8Array,
	options: CompressOptions,
): Promise<Uint8Array> {
	const { PDFDocument, PDFRawStream } = pdfLib;
	const pdfDoc = await PDFDocument.load(pdfBytes);

	const uniqueRefs = collectUniqueImageRefs(pdfLib, pdfDoc);
	const stats = { replaced: 0, skipped: 0, masked: 0 };

	for (const [ref, name] of uniqueRefs.entries()) {
		const stream = pdfDoc.context.lookup(ref);
		if (!(stream instanceof PDFRawStream)) continue;

		const xobj = buildPdfXObjectFromStream(pdfLib, stream, name);
		if (!xobj) continue;

		if (xobj.hasMask) stats.masked++;

		const result = await compressXObject(xobj, options);
		if (!result) continue;

		const written = await writeCompressedXObject(
			pdfLib,
			pdfDoc,
			ref,
			result,
			stream,
		);
		if (written) {
			logger.info(
				`[pdf-compressor] replaced ${name}: ${result.width}x${result.height}, ${stream.contents.length}B → ${result.bytes.length}B`,
			);
			stats.replaced++;
		} else {
			logger.info(
				`[pdf-compressor] skip ${name}: ${result.bytes.length}B >= original ${stream.contents.length}B`,
			);
			stats.skipped++;
		}
	}

	logger.info(
		`[pdf-compressor] done: ${stats.replaced} replaced, ${stats.skipped} skipped (already small), ${stats.masked} with alpha`,
	);

	return pdfDoc.save();
}

function collectUniqueImageRefs(
	pdfLib: PdfLib,
	pdfDoc: PDFDocument,
): Map<PDFRef, string> {
	const { PDFName, PDFDict } = pdfLib;
	const refToName = new Map<PDFRef, string>();

	for (const page of pdfDoc.getPages()) {
		const resources = page.node.Resources();
		if (!resources) continue;

		// lookup throws when XObject value isn't a PDFDict (malformed PDF)
		let xObjectDict: unknown;
		try {
			xObjectDict = resources.lookup(PDFName.of("XObject"), PDFDict);
		} catch {
			continue;
		}
		if (
			!xObjectDict ||
			typeof (xObjectDict as Record<string, unknown>).entries !== "function"
		)
			continue;
		const dictEntries = (
			xObjectDict as { entries(): [unknown, unknown][] }
		).entries();

		for (const [key, ref] of dictEntries) {
			if (!refToName.has(ref as PDFRef)) {
				refToName.set(ref as PDFRef, String(key).replace(/^\//, ""));
			}
		}
	}

	return refToName;
}
