import { useCallback, useState } from "react";
import type { ImageFile } from "../types/image";
import { processFiles, revokeImagePreview } from "../services/fileService";

/**
 * Generates a unique ID for an image
 */
function generateImageId(): string {
	return `image-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Custom hook for image upload functionality
 * Separates business logic from UI components
 */
export function useImageUpload() {
	const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const [previewModal, setPreviewModal] = useState<{
		isOpen: boolean;
		currentIndex: number | null;
	}>({
		isOpen: false,
		currentIndex: null,
	});

	/**
	 * Processes files and updates state
	 */
	const processUploadedFiles = useCallback((fileList: FileList) => {
		const processedFiles = processFiles(fileList);

		// Convert to ImageFile format with unique IDs
		const newImages: ImageFile[] = processedFiles.map((result) => {
			if ("preview" in result && result.preview) {
				return {
					id: generateImageId(),
					file: result.file,
					preview: result.preview,
				};
			} else {
				return {
					id: generateImageId(),
					file: result.file,
					preview: "",
					error: "error" in result ? result.error : undefined,
				};
			}
		});

		setUploadedImages((prev) => [...prev, ...newImages]);
	}, []);

	/**
	 * Removes an image by ID and cleans up its preview URL
	 */
	const removeImage = useCallback((imageId: string) => {
		setUploadedImages((prev) => {
			const newImages = prev.filter((image) => {
				if (image.id === imageId) {
					// Clean up blob URL for removed image
					if (image.preview) {
						revokeImagePreview(image.preview);
					}
					return false; // Remove this image
				}
				return true; // Keep other images
			});
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
	 * Reorders images based on drag and drop operation
	 * Uses arrayMove for proper reordering (handles edge cases)
	 */
	const reorderImages = useCallback((oldIndex: number, newIndex: number) => {
		// Import arrayMove function inline since we have @dnd-kit installed
		const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
			const newArray = array.slice();
			const [removed] = newArray.splice(from, 1);
			newArray.splice(to, 0, removed);
			return newArray;
		};

		setUploadedImages((prev) => arrayMove(prev, oldIndex, newIndex));
		console.log(`Reordered image from position ${oldIndex} to ${newIndex}`);
	}, []);

	/**
	 * Opens the preview modal for a specific image
	 */
	const openPreviewModal = useCallback((imageIndex: number) => {
		console.log(
			"useImageUpload: openPreviewModal called with index:",
			imageIndex,
		);
		setPreviewModal({
			isOpen: true,
			currentIndex: imageIndex,
		});
	}, []);

	/**
	 * Closes the preview modal
	 */
	const closePreviewModal = useCallback(() => {
		setPreviewModal({
			isOpen: false,
			currentIndex: null,
		});
	}, []);

	/**
	 * Changes the current image in the preview modal
	 */
	const setPreviewImage = useCallback((imageIndex: number) => {
		setPreviewModal((prev) => ({
			...prev,
			currentIndex: imageIndex,
		}));
	}, []);

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
		closePreviewModal(); // Close modal when clearing images
	}, [closePreviewModal]);

	return {
		uploadedImages,
		isDragOver,
		processFiles: processUploadedFiles,
		removeImage,
		reorderImages,
		clearAllImages,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
		// Preview modal state and functions
		previewModal,
		openPreviewModal,
		closePreviewModal,
		setPreviewImage,
	};
}
