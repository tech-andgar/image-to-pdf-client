import { useState, useCallback, useMemo, useRef } from "react";
import type {
	ImageFile,
	CompressionResult,
	CompressionStats,
	CompressionPreset,
} from "../types/image";
import { COMPRESSION_PRESETS } from "../types/image";
import {
	compressImagesBatch,
	calculateCompressionStats,
	formatFileSize,
} from "../services/imageCompressionService";

/**
 * Hook for managing image compression functionality
 */
export function useImageCompression() {
	const [isCompressing, setIsCompressing] = useState(false);
	const [compressionError, setCompressionError] = useState<string | null>(null);
	const [currentPreset, setCurrentPreset] =
		useState<CompressionPreset>("medium");
	const [compressionProgress, setCompressionProgress] = useState(0);
	const [compressionStats, setCompressionStats] =
		useState<CompressionStats | null>(null);
	const [compressedImages, setCompressedImages] = useState<CompressionResult[]>(
		[],
	);
	const originalImagesRef = useRef<ImageFile[] | null>(null);

	const currentOptions = useMemo(
		() => COMPRESSION_PRESETS[currentPreset],
		[currentPreset],
	);

	/**
	 * Compresses all images with the current compression settings
	 */
	const compressImages = useCallback(
		async (images: ImageFile[]): Promise<ImageFile[]> => {
			if (images.length === 0) {
				throw new Error("No hay imágenes para comprimir");
			}

			// Save originals on first compression; reuse them on subsequent calls
			if (!originalImagesRef.current) {
				originalImagesRef.current = images;
			}
			const baseImages = originalImagesRef.current;

			setIsCompressing(true);
			setCompressionError(null);
			setCompressionProgress(0);
			setCompressionStats(null);
			setCompressedImages([]);

			try {
				const startTime = Date.now();
				const imageFiles = baseImages.map((img) => img.file);

				// Compress images in batch
				const compressedResults = await compressImagesBatch(
					imageFiles,
					currentOptions,
					(progress, current, total) => {
						setCompressionProgress(progress);
						console.log(`Compressing ${current}/${total} images...`);
					},
				);

				setCompressedImages(compressedResults);

				// Calculate statistics
				const stats = calculateCompressionStats(imageFiles, compressedResults);
				stats.time_elapsed = Date.now() - startTime;
				setCompressionStats(stats);

				// Create updated ImageFile objects with compressed files
				const updatedImages = baseImages.map((originalImg) => {
					const compressed = compressedResults.find((result) =>
						result.file.name.includes(originalImg.file.name.split(".")[0]),
					);

					if (compressed) {
						// Create new preview URL for compressed image
						const compressedPreview = URL.createObjectURL(compressed.file);

						return {
							...originalImg,
							file: compressed.file,
							preview: compressedPreview,
							storageId: undefined,
						};
					}

					return originalImg;
				});

				setCompressionProgress(1);
				return updatedImages;
			} catch (error) {
				console.error("Error during compression:", error);
				const message =
					error instanceof Error ? error.message : "Error en la compresión";
				setCompressionError(message);
				throw error;
			} finally {
				setIsCompressing(false);
			}
		},
		[currentOptions],
	);

	/**
	 * Changes the compression preset
	 */
	const changePreset = useCallback((preset: CompressionPreset) => {
		setCurrentPreset(preset);
	}, []);

	/**
	 * Clears compression error
	 */
	const clearError = useCallback(() => {
		setCompressionError(null);
	}, []);

	/**
	 * Resets compression state
	 */
	const resetCompression = useCallback(() => {
		setIsCompressing(false);
		setCompressionError(null);
		setCompressionProgress(0);
		setCompressionStats(null);
		setCompressedImages([]);
		originalImagesRef.current = null;
	}, []);

	/**
	 * Gets formatted compression statistics
	 */
	const formattedStats = useMemo(() => {
		if (!compressionStats) return null;

		return {
			originalSize: formatFileSize(compressionStats.originalSize),
			compressedSize: formatFileSize(compressionStats.compressedSize),
			savingsPercentage: (
				(1 - compressionStats.compressionRatio) *
				100
			).toFixed(1),
			timeElapsed: `${compressionStats.time_elapsed}ms`,
		};
	}, [compressionStats]);

	/**
	 * Checks if compression would provide significant benefits
	 */
	const hasSignificantSavings = useMemo(() => {
		return compressionStats ? compressionStats.compressionRatio < 0.8 : false;
	}, [compressionStats]);

	return {
		// State
		isCompressing,
		compressionError,
		currentPreset,
		compressionProgress,
		compressionStats,
		compressedImages,
		currentOptions,

		// Computed values
		formattedStats,
		hasSignificantSavings,

		// Actions
		compressImages,
		changePreset,
		clearError,
		resetCompression,

		// Presets
		presets: COMPRESSION_PRESETS,
	};
}
