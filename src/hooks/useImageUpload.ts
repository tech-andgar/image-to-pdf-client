import { useCallback, useState } from "react";
import { ImageFile } from "../types/image";
import { processFiles, revokeImagePreview } from "../services/fileService";

/**
 * Custom hook for image upload functionality
 * Separates business logic from UI components
 */
export function useImageUpload() {
	const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);

	/**
	 * Processes files and updates state
	 */
	const processUploadedFiles = useCallback((fileList: FileList) => {
		const processedFiles = processFiles(fileList);

		// Convert to ImageFile format
		const newImages: ImageFile[] = processedFiles.map((result) => {
			if ("preview" in result && result.preview) {
				return result as ImageFile;
			} else {
				return { ...result, preview: "" } as ImageFile;
			}
		});

		setUploadedImages((prev) => [...prev, ...newImages]);
	}, []);

	/**
	 * Removes an image and cleans up its preview URL
	 */
	const removeImage = useCallback((index: number) => {
		setUploadedImages((prev) => {
			const newImages = [...prev];
			const removed = newImages.splice(index, 1)[0];

			// Clean up blob URL
			if (removed.preview) {
				revokeImagePreview(removed.preview);
			}

			return newImages;
		});
	}, []);

	/**
	 * Handles drag over events
	 */
	const handleDragOver = useCallback(() => {
		setIsDragOver(true);
	}, []);

	/**
	 * Handles drag leave events
	 */
	const handleDragLeave = useCallback(() => {
		setIsDragOver(false);
	}, []);

	/**
	 * Handles file drops
	 */
	const handleDrop = useCallback(
		(files: FileList) => {
			setIsDragOver(false);
			if (files.length > 0) {
				processUploadedFiles(files);
			}
		},
		[processUploadedFiles],
	);

	/**
	 * Handles file selection
	 */
	const handleFileSelect = useCallback(
		(files: FileList | null) => {
			if (files && files.length > 0) {
				processUploadedFiles(files);
			}
		},
		[processUploadedFiles],
	);

	/**
	 * Clears all uploaded images
	 */
	const clearAllImages = useCallback(() => {
		setUploadedImages((prev) => {
			// Clean up all blob URLs
			prev.forEach((image) => {
				if (image.preview) {
					revokeImagePreview(image.preview);
				}
			});
			return [];
		});
	}, []);

	return {
		uploadedImages,
		isDragOver,
		processFiles: processUploadedFiles,
		removeImage,
		clearAllImages,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
	};
}
