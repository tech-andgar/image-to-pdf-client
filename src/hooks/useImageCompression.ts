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
	const compressionCacheRef = useRef<Map<string, ImageFile>>(new Map());

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
			// Merge any new originals not yet tracked (images added after first compression)
			const knownIds = new Set(originalImagesRef.current.map((i) => i.id));
			for (const img of images) {
				if (!knownIds.has(img.id)) {
					originalImagesRef.current.push(img);
				}
			}
			const baseImages = originalImagesRef.current;

			setIsCompressing(true);
			setCompressionError(null);
			setCompressionProgress(0);
			setCompressionStats(null);

			try {
				const startTime = Date.now();

				// Split: cached vs needs compression
				const cache = compressionCacheRef.current;
				const toCompress = baseImages.filter(
					(img) => !cache.has(`${img.id}:${currentPreset}`),
				);

				let compressedResults: Awaited<ReturnType<typeof compressImagesBatch>> =
					[];
				if (toCompress.length > 0) {
					const imageFiles = toCompress.map((img) => img.file);
					compressedResults = await compressImagesBatch(
						imageFiles,
						currentOptions,
						(progress) => setCompressionProgress(progress),
					);

					// Store new results in cache
					toCompress.forEach((originalImg, i) => {
						const compressed = compressedResults[i];
						if (compressed) {
							cache.set(`${originalImg.id}:${currentPreset}`, {
								...originalImg,
								file: compressed.file,
								preview: URL.createObjectURL(compressed.file),
								storageId: undefined,
							});
						}
					});
				}

				// Stats: combine all images (new + cached)
				const allOriginalFiles = baseImages.map((img) => img.file);
				const allCompressedFiles = baseImages.map((img) => {
					const cached = cache.get(`${img.id}:${currentPreset}`);
					return cached
						? { file: cached.file }
						: compressedResults.find((r) =>
								r.file.name.includes(img.file.name.split(".")[0]),
							) ?? { file: img.file };
				});
				const stats = calculateCompressionStats(
					allOriginalFiles,
					allCompressedFiles,
				);
				stats.time_elapsed = Date.now() - startTime;
				setCompressionStats(stats);

				// Build final image list from cache (all should be cached now)
				const updatedImages = baseImages.map(
					(originalImg) =>
						cache.get(`${originalImg.id}:${currentPreset}`) ?? originalImg,
				);

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
		compressionCacheRef.current = new Map();
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
