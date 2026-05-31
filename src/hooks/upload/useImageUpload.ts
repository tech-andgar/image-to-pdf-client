import { useCallback, useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { ImageFile } from "../../types/image";
import { reevaluateDuplicates } from "../../lib/image/file-processing";
import { logger } from "../../services/logger";
import { storageService } from "../../services/storage/storageService";
import { userMetrics } from "../../services/privacy/userMetrics";
import { analytics } from "../../core/analytics";
import { useFileProcessor } from "./useFileProcessor";

function cleanupImage(image: ImageFile) {
	if (image.preview) URL.revokeObjectURL(image.preview);
	storageService.removeImage(image.id).catch((err) =>
		logger.error("Failed to remove image from IndexedDB", {
			id: image.id,
			error: err,
		}),
	);
}

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

			analytics.timeStart("file_processing");
			const { pdfImages, regularImages } = await processFiles(
				fileList,
				currentSnapshot,
			);
			analytics.timeEnd("file_processing");

			const newImages = [...pdfImages, ...regularImages];
			if (newImages.length > 0) {
				setUploadedImages((prev) => [...prev, ...newImages]);
				const totalSize = newImages.reduce((s, img) => s + img.file.size, 0);
				userMetrics.trackFileUploaded(newImages.length, totalSize);
			}
		},
		[processFiles],
	);

	const removeImage = useCallback((imageId: string) => {
		setUploadedImages((prev) =>
			prev.filter((image) => {
				if (image.id !== imageId) return true;
				cleanupImage(image);
				userMetrics.trackImageRemoved();
				return false;
			}),
		);
	}, []);

	const reorderImages = useCallback((oldIndex: number, newIndex: number) => {
		setUploadedImages((prev) => arrayMove(prev, oldIndex, newIndex));
		userMetrics.trackImageReordered();
	}, []);

	const clearAllImages = useCallback(() => {
		setUploadedImages((prev) => {
			for (const img of prev) cleanupImage(img);
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
