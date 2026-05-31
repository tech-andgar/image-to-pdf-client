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
	const originalImagesRef = useRef<ImageFile[] | null>(null);
	const compressionCacheRef = useRef<
		Map<string, { imageFile: ImageFile; result: CompressionResult }>
	>(new Map());

	/**
	 * Compresses all images with the current compression settings
	 */
	const compressImages = useCallback(
		async (
			images: ImageFile[],
			presetOverride?: CompressionPreset,
		): Promise<ImageFile[]> => {
			if (images.length === 0)
				throw new Error("No hay imágenes para comprimir");
			const activePreset = presetOverride ?? currentPreset;

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
					(img) => !cache.has(`${img.id}:${activePreset}`),
				);

				let compressedResults: Awaited<ReturnType<typeof compressImagesBatch>> =
					[];
				if (toCompress.length > 0) {
					const imageFiles = toCompress.map((img) => img.file);
					compressedResults = await compressImagesBatch(
						imageFiles,
						COMPRESSION_PRESETS[activePreset],
						(progress) => setCompressionProgress(progress),
					);

					// Store new results in cache
					toCompress.forEach((originalImg, i) => {
						const compressed = compressedResults[i];
						if (compressed) {
							cache.set(`${originalImg.id}:${activePreset}`, {
								imageFile: {
									...originalImg,
									file: compressed.file,
									preview: URL.createObjectURL(compressed.file),
									storageId: undefined,
								},
								result: compressed,
							});
						}
					});
				}

				// Stats: combine all images (new + cached)
				const allOriginalFiles = baseImages.map((img) => img.file);
				const allCompressedResults: CompressionResult[] = baseImages.map(
					(img) => {
						const cached = cache.get(`${img.id}:${activePreset}`);
						if (cached) return cached.result;
						const fresh = compressedResults.find((r) =>
							r.file.name.includes(img.file.name.split(".")[0]),
						);
						return (
							fresh ?? {
								file: img.file,
								compressedSize: img.file.size,
								compressionRatio: 1,
								dimensions: { width: 0, height: 0 },
							}
						);
					},
				);
				const stats = calculateCompressionStats(
					allOriginalFiles,
					allCompressedResults,
				);
				stats.time_elapsed = Date.now() - startTime;
				setCompressionStats(stats);

				// Build final image list from cache (all should be cached now)
				const updatedImages = baseImages.map(
					(originalImg) =>
						cache.get(`${originalImg.id}:${activePreset}`)?.imageFile ??
						originalImg,
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
		[currentPreset],
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

	const isPresetCached = useCallback(
		(images: ImageFile[], preset?: CompressionPreset) => {
			const key = preset ?? currentPreset;
			return (
				images.length > 0 &&
				images.every((img) =>
					compressionCacheRef.current.has(`${img.id}:${key}`),
				)
			);
		},
		[currentPreset],
	);

	/** Resets UI state only — keeps cache and originals intact */
	const resetCompressionState = useCallback(() => {
		setIsCompressing(false);
		setCompressionError(null);
		setCompressionProgress(0);
		setCompressionStats(null);
	}, []);

	/** Full reset — clears cache and originals (use on new upload/remove) */
	const resetCompression = useCallback(() => {
		setIsCompressing(false);
		setCompressionError(null);
		setCompressionProgress(0);
		setCompressionStats(null);
		originalImagesRef.current = null;
		compressionCacheRef.current = new Map<
			string,
			{ imageFile: ImageFile; result: CompressionResult }
		>();
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
		resetCompressionState,
		isPresetCached,
		originalImages: originalImagesRef.current,
	};
}
