import { useState, useCallback } from "react";
import type {
	ImageFile,
	CompressionResult,
	CompressionStats,
	CompressionPreset,
} from "../../types/image";
import { COMPRESSION_PRESETS } from "../../types/image";
import {
	compressImagesBatch,
	calculateCompressionStats,
} from "../../lib/image/compression";
import { userMetrics } from "../../services/privacy/userMetrics";
import { analytics } from "../../core/analytics";
import { useCompressionCache } from "./useCompressionCache";
import { useCompressionStats } from "./useCompressionStats";

export function useImageCompression() {
	const [isCompressing, setIsCompressing] = useState(false);
	const [compressionError, setCompressionError] = useState<string | null>(null);
	const [currentPreset, setCurrentPreset] =
		useState<CompressionPreset>("medium");
	const [compressionProgress, setCompressionProgress] = useState(0);
	const [compressionStats, setCompressionStats] =
		useState<CompressionStats | null>(null);
	const cache = useCompressionCache();
	const { formattedStats, hasSignificantSavings } =
		useCompressionStats(compressionStats);

	const resetState = useCallback(() => {
		setIsCompressing(false);
		setCompressionError(null);
		setCompressionProgress(0);
		setCompressionStats(null);
	}, []);

	const compressImages = useCallback(
		async (
			images: ImageFile[],
			presetOverride?: CompressionPreset,
		): Promise<ImageFile[]> => {
			if (images.length === 0)
				throw new Error("No hay imágenes para comprimir");
			const activePreset = presetOverride ?? currentPreset;
			const baseImages = cache.mergeOriginals(images);

			setIsCompressing(true);
			setCompressionError(null);
			setCompressionProgress(0);
			setCompressionStats(null);

			try {
				const startTime = Date.now();
				analytics.timeStart("image_compression");

				const toCompress = baseImages.filter(
					(img) => !cache.get(img.id, activePreset),
				);
				let freshResults: Awaited<ReturnType<typeof compressImagesBatch>> = [];

				if (toCompress.length > 0) {
					freshResults = await compressImagesBatch(
						toCompress.map((img) => img.file),
						COMPRESSION_PRESETS[activePreset],
						(progress) => setCompressionProgress(progress),
					);
					toCompress.forEach((originalImg, i) => {
						const compressed = freshResults[i];
						if (!compressed) return;
						cache.set(originalImg.id, activePreset, {
							imageFile: {
								...originalImg,
								file: compressed.file,
								preview: URL.createObjectURL(compressed.file),
								storageId: undefined,
							},
							result: compressed,
						});
					});
				}

				const allResults: CompressionResult[] = baseImages.map((img) => {
					const cached = cache.get(img.id, activePreset);
					if (cached) return cached.result;
					// Fallback for images that failed compression — use original size
					return {
						file: img.file,
						compressedSize: img.file.size,
						compressionRatio: 1,
						dimensions: { width: 0, height: 0 },
					};
				});

				const stats = calculateCompressionStats(
					baseImages.map((img) => img.file),
					allResults,
				);
				stats.time_elapsed = Date.now() - startTime;
				setCompressionStats(stats);
				setCompressionProgress(1);
				analytics.timeEnd("image_compression");

				const reductionPercent =
					stats.originalSize > 0
						? Math.round((1 - stats.compressedSize / stats.originalSize) * 100)
						: 0;
				userMetrics.trackCompressionUsed(activePreset, reductionPercent);

				return baseImages.map(
					(img) => cache.get(img.id, activePreset)?.imageFile ?? img,
				);
			} catch (error) {
				setCompressionError(
					error instanceof Error ? error.message : "Error en la compresión",
				);
				throw error;
			} finally {
				setIsCompressing(false);
			}
		},
		[currentPreset, cache],
	);

	const changePreset = useCallback(
		(preset: CompressionPreset) => setCurrentPreset(preset),
		[],
	);
	const clearError = useCallback(() => setCompressionError(null), []);
	const isPresetCached = useCallback(
		(images: ImageFile[], preset?: CompressionPreset) =>
			cache.isAllCached(images, preset ?? currentPreset),
		[currentPreset, cache],
	);
	const resetCompressionState = useCallback(() => resetState(), [resetState]);
	const resetCompression = useCallback(() => {
		resetState();
		cache.reset();
		import("../../lib/image/compression-worker-pool").then(
			({ terminateCompressionWorker }) => {
				terminateCompressionWorker();
			},
		);
	}, [resetState, cache]);

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
		originalImages: cache.originals,
	};
}
