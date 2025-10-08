import { useCallback, useState, useEffect } from "react";
import type { ImageFile, FileSignature } from "../types/image";
import {
	processFilesWithDuplicateCheck,
	getFileSignaturesFromImages,
	revokeImagePreview,
	createImagePreview,
} from "../services/fileService";
import { areFilesIdentical, createFileSignature } from "../types/image";
import { logger } from "../services/logger";

/**
 * Generates a unique ID for an image
 */
function generateImageId(): string {
	return `image-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Custom hook for image upload functionality with duplicate checking
 * Separates business logic from UI components
 */
export function useImageUpload() {
	const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const [allowDuplicates, setAllowDuplicates] = useState(false);
	const [previewModal, setPreviewModal] = useState<{
		isOpen: boolean;
		currentIndex: number | null;
	}>({
		isOpen: false,
		currentIndex: null,
	});

	/**
	 * Processes files and updates state with duplicate checking
	 */
	const processUploadedFiles = useCallback((fileList: FileList) => {
		setUploadedImages((currentImages) => {
			logger.trackFileOperation("upload started", fileList.length, 0);

			// Get signatures of existing images for duplicate checking
			const existingSignatures = getFileSignaturesFromImages(currentImages);

			// Process files with duplicate checking
			const processedFiles = processFilesWithDuplicateCheck(
				fileList,
				existingSignatures,
				allowDuplicates,
			);

			// Convert to ImageFile format with unique IDs
			const newImages: ImageFile[] = processedFiles.map((result) => {
				if ("preview" in result && result.preview) {
					return {
						id: generateImageId(),
						file: result.file,
						preview: result.preview,
					} satisfies ImageFile;
				} else {
					logger.warn("File processing error", {
						fileName: result.file.name,
						error: "error" in result ? result.error : "Unknown error",
					});
					return {
						id: generateImageId(),
						file: result.file,
						preview: "",
						error: "error" in result ? result.error : undefined,
					} satisfies ImageFile;
				}
			});

			const updatedImages = [...currentImages, ...newImages];

			const successCount = newImages.filter((img) => !img.error).length;
			const errorCount = newImages.filter((img) => img.error).length;

			logger.trackFileOperation(
				"upload completed",
				successCount,
				newImages.reduce((total, img) => total + img.file.size, 0),
			);

			if (errorCount > 0) {
				logger.warn(`${errorCount} files failed to process`);
			}

			return updatedImages;
		});
	}, [allowDuplicates]);

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
		logger.trackUserAction("image reordered", { from: oldIndex, to: newIndex });
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

	/**
	 * Reevaluates existing images when allowDuplicates setting changes
	 * Converts duplicate images between preview and error states as needed
	 */
	useEffect(() => {
		setUploadedImages((currentImages) => {
			if (currentImages.length === 0) return currentImages;

			// Create a map to track which file signatures have been seen
			const seenSignatures = new Map<string, number>();
			const updatedImages = currentImages.map((image) => {
				const signature = createFileSignature(image.file);

				// Check if this file signature has been seen before (is duplicate)
				const isDuplicate = seenSignatures.has(signature.name + signature.size + signature.lastModified);

				if (isDuplicate && !allowDuplicates) {
					// Convert to error state: remove preview and set error
					if (image.preview) {
						revokeImagePreview(image.preview);
					}
					return {
						...image,
						preview: "",
						error: "Esta imagen ya se ha cargado anteriormente. Marca la opción 'Permitir imágenes duplicadas' para cargar múltiples copias.",
					} satisfies ImageFile;
				} else if (!isDuplicate || allowDuplicates) {
					// Convert to normal state: create preview and remove error
					if (!image.preview && image.error?.includes("ya se ha cargado")) {
						return {
							...image,
							preview: createImagePreview(image.file),
							error: undefined,
						} satisfies ImageFile;
					}
				}

				// Mark this signature as seen (only for the first occurrence)
				if (!isDuplicate) {
					seenSignatures.set(signature.name + signature.size + signature.lastModified, 1);
				}

				return image;
			});

			return updatedImages;
		});
	}, [allowDuplicates]);

	return {
		uploadedImages,
		isDragOver,
		allowDuplicates,
		setAllowDuplicates,
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
