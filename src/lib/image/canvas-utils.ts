export function bitmapToBlob(
	bitmap: ImageBitmap,
	mimeType: "image/jpeg" | "image/webp",
	quality: number,
): Promise<Blob> {
	const canvas = document.createElement("canvas");
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No 2d canvas context");
	ctx.drawImage(bitmap, 0, 0);
	return new Promise((resolve, reject) =>
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
			mimeType,
			quality,
		),
	);
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
	return new Uint8Array(await blob.arrayBuffer());
}

export function createBlobUrl(bytes: Uint8Array, mimeType: string): string {
	return URL.createObjectURL(
		new Blob([bytes.buffer as ArrayBuffer], { type: mimeType }),
	);
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = url;
	});
}

/**
 * Extracts RGB as JPEG bytes and alpha channel as raw grayscale bytes from a bitmap.
 * Used for PDF images with transparency — RGB goes to DCTDecode, alpha to a FlateDecode SMask.
 */
export async function extractRgbAndAlpha(
	bitmap: ImageBitmap,
	quality: number,
): Promise<{ rgbJpeg: Uint8Array; alphaRaw: Uint8Array }> {
	const { width, height } = bitmap;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No 2d canvas context");
	ctx.drawImage(bitmap, 0, 0);

	const imageData = ctx.getImageData(0, 0, width, height);
	const pixels = imageData.data; // RGBA interleaved

	// Extract alpha as grayscale bytes (1 byte per pixel)
	const alphaRaw = new Uint8Array(width * height);
	for (let i = 0; i < width * height; i++) {
		alphaRaw[i] = pixels[i * 4 + 3];
	}

	// Encode RGB as JPEG (alpha ignored by toBlob)
	const rgbBlob = await new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
			"image/jpeg",
			quality,
		),
	);
	const rgbJpeg = new Uint8Array(await rgbBlob.arrayBuffer());

	return { rgbJpeg, alphaRaw };
}

export async function imageToBlobViaCanvas(
	source: HTMLImageElement | ImageBitmap,
	mimeType: "image/jpeg" | "image/webp",
	quality: number,
): Promise<Blob> {
	const canvas = document.createElement("canvas");
	const w =
		source instanceof HTMLImageElement ? source.naturalWidth : source.width;
	const h =
		source instanceof HTMLImageElement ? source.naturalHeight : source.height;
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No 2d canvas context");
	ctx.drawImage(source, 0, 0);
	return new Promise((resolve, reject) =>
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
			mimeType,
			quality,
		),
	);
}
