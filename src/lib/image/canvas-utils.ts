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
