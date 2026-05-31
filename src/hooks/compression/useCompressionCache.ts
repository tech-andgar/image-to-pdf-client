import { useRef, useCallback } from "react";
import type {
	ImageFile,
	CompressionResult,
	CompressionPreset,
} from "../../types/image";

type CacheEntry = { imageFile: ImageFile; result: CompressionResult };
type Cache = Map<string, CacheEntry>;

function cacheKey(imageId: string, preset: CompressionPreset) {
	return `${imageId}:${preset}`;
}

function revokeEntry(entry: CacheEntry) {
	if (entry.imageFile.preview) URL.revokeObjectURL(entry.imageFile.preview);
}

export function useCompressionCache() {
	const originalsRef = useRef<ImageFile[] | null>(null);
	const cacheRef = useRef<Cache>(new Map());

	const mergeOriginals = useCallback((images: ImageFile[]) => {
		originalsRef.current ??= images;
		const knownIds = new Set(originalsRef.current.map((i) => i.id));
		for (const img of images) {
			if (!knownIds.has(img.id)) originalsRef.current.push(img);
		}
		return originalsRef.current;
	}, []);

	const get = useCallback((imageId: string, preset: CompressionPreset) => {
		return cacheRef.current.get(cacheKey(imageId, preset));
	}, []);

	const set = useCallback(
		(imageId: string, preset: CompressionPreset, entry: CacheEntry) => {
			const key = cacheKey(imageId, preset);
			const existing = cacheRef.current.get(key);
			if (existing) revokeEntry(existing);
			cacheRef.current.set(key, entry);
		},
		[],
	);

	const isAllCached = useCallback(
		(images: ImageFile[], preset: CompressionPreset) =>
			images.length > 0 &&
			images.every((img) => cacheRef.current.has(cacheKey(img.id, preset))),
		[],
	);

	const reset = useCallback(() => {
		for (const entry of cacheRef.current.values()) revokeEntry(entry);
		originalsRef.current = null;
		cacheRef.current = new Map();
	}, []);

	return {
		get originals() {
			return originalsRef.current;
		},
		mergeOriginals,
		get,
		set,
		isAllCached,
		reset,
	};
}
