import type {
	CompressionOptions,
	CompressionResult,
	CompressionStats,
} from "../types/image";

/**
 * Loads an image from a File object and prepares it for compression
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = URL.createObjectURL(file);
	});
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
	const extension = originalFilename.split(".").pop()?.toLowerCase();
	const baseName = originalFilename.replace(/\.[^/.]+$/, "");
	const qualitySuffix = Math.round(options.quality * 100);

	return `${baseName}_compressed_q${qualitySuffix}.${extension}`;
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

		// Draw and compress
		ctx.drawImage(img, 0, 0, width, height);

		// Convert to blob with compression
		const mimeType = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
		const quality = mimeType === "image/jpeg" ? options.quality : undefined;

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error("Failed to compress image"));
					}
				},
				mimeType,
				quality,
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
