import type {
	CompressionOptions,
	CompressionResult,
	CompressionStats,
} from "../types/image";
import { loadImageFromUrl } from "../lib/image/canvas-utils";

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
	return loadImageFromUrl(URL.createObjectURL(file));
}

/**
 * Calculates the new dimensions based on compression options
 */
function calculateDimensions(
	originalWidth: number,
	originalHeight: number,
	options: CompressionOptions,
): { width: number; height: number } {
	let { width, height } = { width: originalWidth, height: originalHeight };

	// Resize if max dimensions are specified
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

/**
 * Generates a filename for the compressed image
 */
function generateCompressedFilename(
	originalFilename: string,
	options: CompressionOptions,
): string {
	const baseName = originalFilename.replace(/\.[^/.]+$/, "");
	const qualitySuffix = Math.round(options.quality * 100);

	return `${baseName}_compressed_q${qualitySuffix}.jpg`;
}

/**
 * Compresses a single image file using Canvas API
 */
export async function compressImageFile(
	file: File,
	options: CompressionOptions,
): Promise<CompressionResult> {
	try {
		const img = await loadImageFromFile(file);
		const { width, height } = calculateDimensions(
			img.width,
			img.height,
			options,
		);

		// Create canvas for compression
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Canvas context not available");
		}

		canvas.width = width;
		canvas.height = height;

		// For formats with potential transparency (PNG, WebP), fill white before drawing
		// so JPEG export doesn't produce black artifacts on transparent areas
		const mimeType = "image/jpeg";
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, width, height);
		ctx.drawImage(img, 0, 0, width, height);

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(b) => (b ? resolve(b) : reject(new Error("Failed to compress image"))),
				mimeType,
				options.quality,
			);
		});

		// Create new file
		const filename = generateCompressedFilename(file.name, options);
		const compressedFile = new File([blob], filename, { type: mimeType });

		// Calculate compression stats
		const compressionRatio = compressedFile.size / file.size;

		// Clean up
		URL.revokeObjectURL(img.src);

		return {
			file: compressedFile,
			compressedSize: compressedFile.size,
			compressionRatio,
			dimensions: { width, height },
		};
	} catch (error) {
		console.error("Error compressing image:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to compress image",
		);
	}
}

/**
 * Compresses multiple images in parallel with progress tracking
 */
export async function compressImagesBatch(
	files: File[],
	options: CompressionOptions,
	onProgress?: (progress: number, current: number, total: number) => void,
): Promise<CompressionResult[]> {
	const results: CompressionResult[] = [];
	const total = files.length;

	for (let i = 0; i < files.length; i++) {
		try {
			const result = await compressImageFile(files[i], options);
			results.push(result);

			if (onProgress) {
				onProgress((i + 1) / total, i + 1, total);
			}
		} catch (error) {
			console.warn(`Failed to compress ${files[i].name}:`, error);
			// Skip failed compressions, continue with others
		}
	}

	return results;
}

/**
 * Calculates compression statistics for a batch of images
 */
export function calculateCompressionStats(
	originalFiles: File[],
	compressedResults: CompressionResult[],
): CompressionStats {
	const originalSize = originalFiles.reduce((sum, file) => sum + file.size, 0);
	const compressedSize = compressedResults.reduce(
		(sum, result) => sum + result.compressedSize,
		0,
	);
	const compressionRatio = compressedSize / originalSize;

	return {
		originalSize,
		compressedSize,
		compressionRatio,
		time_elapsed: 0, // Would be set by caller if needed
	};
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
