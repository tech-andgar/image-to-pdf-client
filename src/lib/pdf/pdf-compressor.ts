import {
	PDFDocument,
	PDFName,
	PDFDict,
	PDFRawStream,
	type PDFRef,
} from "pdf-lib";
import type { CompressOptions } from "./types";
import { buildPdfXObjectFromStream } from "./xobject-extractor";
import { compressXObject } from "./xobject-compressor";
import { writeCompressedXObject } from "./xobject-writer";
import { logger } from "../../services/logger";

/**
 * Compresses all embedded image XObjects in a PDF in a single pass.
 * Each unique XObject ref is processed once — shared images across pages stay shared.
 */
export async function compressAllPdfImages(
	pdfBytes: Uint8Array,
	options: CompressOptions,
): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.load(pdfBytes);

	const uniqueRefs = collectUniqueImageRefs(pdfDoc);
	const stats = { replaced: 0, skipped: 0, masked: 0 };

	for (const [ref, name] of uniqueRefs.entries()) {
		const stream = pdfDoc.context.lookup(ref);
		if (!(stream instanceof PDFRawStream)) continue;

		const xobj = buildPdfXObjectFromStream(stream, name);
		if (!xobj) continue;

		if (xobj.hasMask) stats.masked++;

		const result = await compressXObject(xobj, options);
		if (!result) continue;

		const written = await writeCompressedXObject(pdfDoc, ref, result, stream);
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

function collectUniqueImageRefs(pdfDoc: PDFDocument): Map<PDFRef, string> {
	const refToName = new Map<PDFRef, string>();

	for (const page of pdfDoc.getPages()) {
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

	return refToName;
}
