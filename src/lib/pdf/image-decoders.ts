import type { ImageDecoder, PdfXObject } from "./types";

class DctDecoder implements ImageDecoder {
	canDecode(filterName: string | null): boolean {
		return filterName === "DCTDecode";
	}

	async decode(xobj: PdfXObject): Promise<ImageBitmap> {
		const blob = new Blob([xobj.rawBytes.buffer as ArrayBuffer], {
			type: "image/jpeg",
		});
		return createImageBitmap(blob);
	}
}

class Jpeg2000Decoder implements ImageDecoder {
	canDecode(filterName: string | null): boolean {
		return filterName === "JPXDecode";
	}

	async decode(xobj: PdfXObject): Promise<ImageBitmap> {
		const blob = new Blob([xobj.rawBytes.buffer as ArrayBuffer], {
			type: "image/jp2",
		});
		return createImageBitmap(blob);
	}
}

class FlateDecoder implements ImageDecoder {
	canDecode(filterName: string | null): boolean {
		return filterName === "FlateDecode" || filterName === null;
	}

	async decode(xobj: PdfXObject): Promise<ImageBitmap> {
		// Raw or flate-decoded bytes are RGBA pixels — reconstruct via ImageData
		const { width, height, rawBytes } = xobj;
		const expectedSize = width * height * 4;

		let rgba: Uint8ClampedArray;
		if (rawBytes.length === expectedSize) {
			rgba = new Uint8ClampedArray(rawBytes);
		} else if (rawBytes.length === width * height * 3) {
			// RGB without alpha
			rgba = new Uint8ClampedArray(expectedSize);
			for (let i = 0; i < width * height; i++) {
				rgba[i * 4] = rawBytes[i * 3];
				rgba[i * 4 + 1] = rawBytes[i * 3 + 1];
				rgba[i * 4 + 2] = rawBytes[i * 3 + 2];
				rgba[i * 4 + 3] = 255;
			}
		} else {
			throw new Error(
				`Unexpected raw byte length: ${rawBytes.length} for ${width}x${height}`,
			);
		}

		const imageData = new ImageData(
			new Uint8ClampedArray(rgba.buffer as ArrayBuffer),
			width,
			height,
		);
		return createImageBitmap(imageData);
	}
}

// Registry — OCP: add new decoders without touching existing ones
const DECODERS: ImageDecoder[] = [
	new DctDecoder(),
	new Jpeg2000Decoder(),
	new FlateDecoder(),
];

export function findDecoder(filterName: string | null): ImageDecoder | null {
	return DECODERS.find((d) => d.canDecode(filterName)) ?? null;
}
