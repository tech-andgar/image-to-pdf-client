import { useState, useCallback, useMemo, useRef } from "react";
import type {
	ImageFile,
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
			if (images.length === 0)
				throw new Error("No hay imágenes para comprimir");

			originalImagesRef.current ??= images;
			const baseImages = originalImagesRef.current;

			setIsCompressing(true);
			setCompressionError(null);
			setCompressionProgress(0);
			setCompressionStats(null);

			try {
				const startTime = Date.now();
				const imageFiles = baseImages.map((img) => img.file);

				// Compress images in batch
				const compressedResults = await compressImagesBatch(
					imageFiles,
					currentOptions,
					(progress) => setCompressionProgress(progress),
				);

				const stats = calculateCompressionStats(imageFiles, compressedResults);
				stats.time_elapsed = Date.now() - startTime;
				setCompressionStats(stats);

				// Create updated ImageFile objects with compressed files
				const updatedImages = baseImages.map((originalImg) => {
					const compressed = compressedResults.find((result) =>
						result.file.name.includes(originalImg.file.name.split(".")[0]),
					);
					if (!compressed) return originalImg;
					return {
						...originalImg,
						file: compressed.file,
						preview: URL.createObjectURL(compressed.file),
						storageId: undefined,
					};
				});

				setCompressionProgress(1);
				return updatedImages;
			} catch (error) {
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

	const hasSignificantSavings = useMemo(
		() => (compressionStats ? compressionStats.compressionRatio < 0.8 : false),
		[compressionStats],
	);

	return {
		isCompressing,
		compressionError,
		currentPreset,
		compressionProgress,
		formattedStats,
		hasSignificantSavings,
		compressImages,
		changePreset,
		clearError,
		resetCompression,
		originalImages: originalImagesRef.current,
	};
}
