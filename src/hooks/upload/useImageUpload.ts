import { useCallback, useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { ImageFile } from "../../types/image";
import { reevaluateDuplicates } from "../../lib/image/file-processing";
import { logger } from "../../services/logger";
import { storageService } from "../../services/storageService";
import { useFileProcessor } from "./useFileProcessor";

export function useImageUpload() {
	const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const [allowDuplicates, setAllowDuplicates] = useState(false);
	const { processFiles } = useFileProcessor(allowDuplicates);

	const addFiles = useCallback(
		async (fileList: FileList) => {
			let currentSnapshot: ImageFile[] = [];
			setUploadedImages((c) => {
				currentSnapshot = c;
				return c;
			});

			const { pdfImages, regularImages } = await processFiles(
				fileList,
				currentSnapshot,
			);
			const newImages = [...pdfImages, ...regularImages];
			if (newImages.length > 0) {
				setUploadedImages((prev) => [...prev, ...newImages]);
			}
		},
		[processFiles],
	);

	const removeImage = useCallback((imageId: string) => {
		setUploadedImages((prev) =>
			prev.filter((image) => {
				if (image.id !== imageId) return true;
				if (image.preview) URL.revokeObjectURL(image.preview);
				storageService.removeImage(imageId).catch((err) =>
					logger.error("Failed to remove image from IndexedDB", {
						id: imageId,
						error: err,
					}),
				);
				return false;
			}),
		);
	}, []);

	const reorderImages = useCallback((oldIndex: number, newIndex: number) => {
		setUploadedImages((prev) => arrayMove(prev, oldIndex, newIndex));
		logger.trackUserAction("image reordered", { from: oldIndex, to: newIndex });
	}, []);

	const clearAllImages = useCallback(() => {
		setUploadedImages((prev) => {
			for (const img of prev) if (img.preview) URL.revokeObjectURL(img.preview);
			storageService
				.clearAll()
				.catch((err) => logger.error("Failed to clear IndexedDB", err));
			return [];
		});
	}, []);

	const handleDragOver = useCallback(() => setIsDragOver(true), []);
	const handleDragLeave = useCallback(() => setIsDragOver(false), []);

	const handleDrop = useCallback(
		(files: FileList) => {
			setIsDragOver(false);
			if (files.length > 0) addFiles(files);
		},
		[addFiles],
	);

	const handleFileSelect = useCallback(
		(files: FileList | null) => {
			if (files?.length) addFiles(files);
		},
		[addFiles],
	);

	const updateImages = useCallback(
		(images: ImageFile[]) => setUploadedImages(images),
		[],
	);

	useEffect(() => {
		setUploadedImages((current) => {
			if (current.length === 0) return current;
			return reevaluateDuplicates(current, allowDuplicates);
		});
	}, [allowDuplicates]);

	return {
		uploadedImages,
		isDragOver,
		allowDuplicates,
		setAllowDuplicates,
		removeImage,
		reorderImages,
		clearAllImages,
		updateImages,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
	};
}
