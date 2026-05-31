import type {
	CompressionOptions,
	CompressionResult,
	CompressionStats,
} from "../../types/image";
import { MAX_IMAGE_PIXELS } from "../../config/limits";
import { loadImageFromUrl } from "./canvas-utils";

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
	return loadImageFromUrl(URL.createObjectURL(file));
}

function calculateDimensions(
	originalWidth: number,
	originalHeight: number,
	options: CompressionOptions,
): { width: number; height: number } {
	let { width, height } = { width: originalWidth, height: originalHeight };

	if (options.maxWidth && width > options.maxWidth) {
		const ratio = options.maxWidth / width;
		width = options.maxWidth;
		height = options.maintainAspectRatio ? height * ratio : height;
	}

	if (options.maxHeight && height > options.maxHeight) {
		const ratio = options.maxHeight / height;
		height = options.maxHeight;
		width = options.maintainAspectRatio ? width * ratio : width;
	}

	return { width: Math.round(width), height: Math.round(height) };
}

function generateCompressedFilename(
	originalFilename: string,
	options: CompressionOptions,
): string {
	const baseName = originalFilename.replace(/\.[^/.]+$/, "");
	return `${baseName}_compressed_q${Math.round(options.quality * 100)}.jpg`;
}

export async function compressImageFile(
	file: File,
	options: CompressionOptions,
): Promise<CompressionResult> {
	const img = await loadImageFromFile(file);

	if (img.width * img.height > MAX_IMAGE_PIXELS) {
		URL.revokeObjectURL(img.src);
		throw new Error(
			`Imagen demasiado grande (${img.width}x${img.height}). Máximo ~100 megapíxeles.`,
		);
	}

	const { width, height } = calculateDimensions(img.width, img.height, options);

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas context not available");

	canvas.width = width;
	canvas.height = height;
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, width, height);
	ctx.drawImage(img, 0, 0, width, height);
	URL.revokeObjectURL(img.src);

	const blob = await new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error("Failed to compress image"))),
			"image/jpeg",
			options.quality,
		),
	);

	const compressedFile = new File(
		[blob],
		generateCompressedFilename(file.name, options),
		{
			type: "image/jpeg",
		},
	);

	return {
		file: compressedFile,
		compressedSize: compressedFile.size,
		compressionRatio: compressedFile.size / file.size,
		dimensions: { width, height },
	};
}

export async function compressImagesBatch(
	files: File[],
	options: CompressionOptions,
	onProgress?: (progress: number, current: number, total: number) => void,
): Promise<CompressionResult[]> {
	const results: CompressionResult[] = [];
	for (let i = 0; i < files.length; i++) {
		try {
			results.push(await compressImageFile(files[i], options));
		} catch {
			// skip failed, continue
		}
		onProgress?.((i + 1) / files.length, i + 1, files.length);
	}
	return results;
}

export function calculateCompressionStats(
	originalFiles: File[],
	compressedResults: CompressionResult[],
): CompressionStats {
	const originalSize = originalFiles.reduce((sum, f) => sum + f.size, 0);
	const compressedSize = compressedResults.reduce(
		(sum, r) => sum + r.compressedSize,
		0,
	);
	return {
		originalSize,
		compressedSize,
		compressionRatio: compressedSize / originalSize,
		time_elapsed: 0,
	};
}

export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let i = 0;
	while (size >= 1024 && i < units.length - 1) {
		size /= 1024;
		i++;
	}
	return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
