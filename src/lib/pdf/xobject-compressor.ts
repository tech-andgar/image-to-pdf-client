import type { CompressedXObject, CompressOptions, PdfXObject } from "./types";
import { findDecoder } from "./image-decoders";
import {
	bitmapToBlob,
	blobToUint8Array,
	extractRgbAndAlpha,
} from "../image/canvas-utils";

export async function compressXObject(
	xobj: PdfXObject,
	options: CompressOptions,
): Promise<CompressedXObject | null> {
	const decoder = findDecoder(xobj.filterName);
	if (!decoder) return null;

	try {
		const bitmap = await decoder.decode(xobj);

		if (xobj.hasMask) {
			// Split: RGB → JPEG, alpha → raw grayscale for SMask
			const { rgbJpeg, alphaRaw } = await extractRgbAndAlpha(
				bitmap,
				options.quality,
			);
			bitmap.close();
			return {
				name: xobj.name,
				bytes: rgbJpeg,
				width: xobj.width,
				height: xobj.height,
				alphaMask: alphaRaw,
			};
		}

		const blob = await bitmapToBlob(bitmap, options.mimeType, options.quality);
		bitmap.close();
		const bytes = await blobToUint8Array(blob);
		return { name: xobj.name, bytes, width: xobj.width, height: xobj.height };
	} catch {
		// Unsupported or malformed — leave original intact
		return null;
	}
}
