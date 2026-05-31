import type { CompressedXObject, CompressOptions, PdfXObject } from "./types";
import { findDecoder } from "./image-decoders";
import { bitmapToBlob, blobToUint8Array } from "../image/canvas-utils";

export async function compressXObject(
	xobj: PdfXObject,
	options: CompressOptions,
): Promise<CompressedXObject | null> {
	const decoder = findDecoder(xobj.filterName);
	if (!decoder) return null;

	try {
		const bitmap = await decoder.decode(xobj);
		const blob = await bitmapToBlob(bitmap, options.mimeType, options.quality);
		bitmap.close();
		const bytes = await blobToUint8Array(blob);
		return { name: xobj.name, bytes, width: xobj.width, height: xobj.height };
	} catch {
		// Unsupported or malformed — leave original intact
		return null;
	}
}
