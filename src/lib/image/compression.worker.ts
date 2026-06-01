// Web Worker for image compression — runs canvas ops off the main thread

interface CompressOptions {
	quality: number;
	maxWidth?: number;
	maxHeight?: number;
	maintainAspectRatio: boolean;
	maxImagePixels: number;
}

interface CompressRequest {
	id: number;
	file: File;
	options: CompressOptions;
}

interface CompressResponse {
	id: number;
	blob?: Blob;
	width?: number;
	height?: number;
	error?: string;
}

function calculateDimensions(
	w: number,
	h: number,
	options: CompressOptions,
): { width: number; height: number } {
	let width = w;
	let height = h;

	if (options.maxWidth && width > options.maxWidth) {
		const ratio = options.maxWidth / width;
		width = options.maxWidth;
		if (options.maintainAspectRatio) height = height * ratio;
	}
	if (options.maxHeight && height > options.maxHeight) {
		const ratio = options.maxHeight / height;
		height = options.maxHeight;
		if (options.maintainAspectRatio) width = width * ratio;
	}

	return { width: Math.round(width), height: Math.round(height) };
}

async function compressFile(
	file: File,
	options: CompressOptions,
): Promise<{ blob: Blob; width: number; height: number }> {
	const bitmap = await createImageBitmap(file);

	if (bitmap.width * bitmap.height > options.maxImagePixels) {
		bitmap.close();
		throw new Error(
			`Imagen demasiado grande (${bitmap.width}x${bitmap.height}). Máximo ~100 megapíxeles.`,
		);
	}

	const { width, height } = calculateDimensions(
		bitmap.width,
		bitmap.height,
		options,
	);

	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No OffscreenCanvas context");

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, width, height);
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const blob = await canvas.convertToBlob({
		type: "image/jpeg",
		quality: options.quality,
	});
	return { blob, width, height };
}

globalThis.onmessage = async (e: MessageEvent<CompressRequest>) => {
	const { id, file, options } = e.data;
	try {
		const { blob, width, height } = await compressFile(file, options);
		const response: CompressResponse = { id, blob, width, height };
		(globalThis as unknown as Worker).postMessage(response);
	} catch (err) {
		const response: CompressResponse = {
			id,
			error: err instanceof Error ? err.message : "Compression failed",
		};
		(globalThis as unknown as Worker).postMessage(response);
	}
};
