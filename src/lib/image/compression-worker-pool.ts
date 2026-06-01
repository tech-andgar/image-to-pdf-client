import type { CompressionOptions, CompressionResult } from "../../types/image";
import { MAX_IMAGE_PIXELS } from "../../config/limits";

interface WorkerResponse {
	id: number;
	blob?: Blob;
	width?: number;
	height?: number;
	error?: string;
}

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<
	number,
	{
		resolve: (r: CompressionResult) => void;
		reject: (e: Error) => void;
		file: File;
	}
>();

function getWorker(): Worker | null {
	if (worker) return worker;
	if (!("OffscreenCanvas" in globalThis)) return null;
	try {
		worker = new Worker(new URL("./compression.worker.ts", import.meta.url), {
			type: "module",
		});
		worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
			const { id, blob, width, height, error } = e.data;
			const entry = pending.get(id);
			if (!entry) return;
			pending.delete(id);

			if (error || !blob || width === undefined || height === undefined) {
				entry.reject(new Error(error ?? "Worker compression failed"));
				return;
			}

			const baseName = entry.file.name.replace(/\.[^/.]+$/, "");
			const compressedFile = new File([blob], `${baseName}_compressed.jpg`, {
				type: "image/jpeg",
			});
			entry.resolve({
				file: compressedFile,
				compressedSize: compressedFile.size,
				compressionRatio: compressedFile.size / entry.file.size,
				dimensions: { width, height },
			});
		};
		worker.onerror = (e) => {
			// On worker error, reject all pending and reset so next call falls back to main thread
			for (const [, entry] of pending) {
				entry.reject(new Error(e.message ?? "Worker error"));
			}
			pending.clear();
			worker = null;
		};
		return worker;
	} catch {
		return null;
	}
}

export async function compressInWorker(
	file: File,
	options: CompressionOptions,
): Promise<CompressionResult> {
	const w = getWorker();
	if (!w) {
		// Fall back to main-thread compression
		const { compressImageFile } = await import("./compression");
		return compressImageFile(file, options);
	}

	return new Promise((resolve, reject) => {
		const id = nextId++;
		pending.set(id, { resolve, reject, file });
		w.postMessage({
			id,
			file,
			options: {
				quality: options.quality,
				maxWidth: options.maxWidth,
				maxHeight: options.maxHeight,
				maintainAspectRatio: options.maintainAspectRatio,
				maxImagePixels: MAX_IMAGE_PIXELS,
			},
		});
	});
}

export function terminateCompressionWorker() {
	worker?.terminate();
	worker = null;
	pending.clear();
}
