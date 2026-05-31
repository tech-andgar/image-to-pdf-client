import { useCallback, useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { ImageFile } from "../types/image";
import {
	processFilesWithDuplicateCheck,
	getFileSignaturesFromImages,
	revokeImagePreview,
	createImagePreview,
	isPdf,
} from "../services/fileService";
import { createFileSignature } from "../types/image";
import { logger } from "../services/logger";
import { storageService } from "../services/storageService";
import { pdfToImageFiles } from "../services/pdfImportService";
import { usePreviewModal } from "./usePreviewModal";

function generateImageId(): string {
	return `image-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function buildImageFiles(
	fileList: FileList,
	existingImages: ImageFile[],
	allowDuplicates: boolean,
): ImageFile[] {
	const existingSignatures = getFileSignaturesFromImages(existingImages);
	const results = processFilesWithDuplicateCheck(
		fileList,
		existingSignatures,
		allowDuplicates,
	);

	return results.map((result) => {
		const id = generateImageId();
		if ("preview" in result && result.preview) {
			storageService
				.saveImage(result.file, id)
				.catch((err) =>
					logger.error("Failed to save image to IndexedDB", { id, error: err }),
				);
			return { id, file: result.file, preview: result.preview, storageId: id };
		}
		logger.warn("File processing error", {
			fileName: result.file.name,
			error: "error" in result ? result.error : "Unknown error",
		});
		return {
			id,
			file: result.file,
			preview: "",
			error: "error" in result ? result.error : undefined,
		};
	});
}

function reevaluateDuplicates(
	images: ImageFile[],
	allowDuplicates: boolean,
): ImageFile[] {
	const seen = new Map<string, number>();
	return images.map((image) => {
		const sig = createFileSignature(image.file);
		const key = sig.name + sig.size + sig.lastModified;
		const isDuplicate = seen.has(key);

		if (isDuplicate && !allowDuplicates) {
			if (image.preview) revokeImagePreview(image.preview);
			return {
				...image,
				preview: "",
				error:
					"Esta imagen ya se ha cargado anteriormente. Marca la opción 'Permitir imágenes duplicadas' para cargar múltiples copias.",
			} satisfies ImageFile;
		}

		if (
			(!isDuplicate || allowDuplicates) &&
			!image.preview &&
			image.error?.includes("ya se ha cargado")
		) {
			return {
				...image,
				preview: createImagePreview(image.file),
				error: undefined,
			} satisfies ImageFile;
		}

		if (!isDuplicate) seen.set(key, 1);
		return image;
	});
}

export function useImageUpload() {
	const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const [allowDuplicates, setAllowDuplicates] = useState(false);
	const modal = usePreviewModal();

	const processUploadedFiles = useCallback(
		async (fileList: FileList) => {
			const filesArray = Array.from(fileList);
			logger.trackFileOperation("upload started", filesArray.length, 0);

			const pdfFiles = filesArray.filter(isPdf);
			const imageFiles = filesArray.filter((f) => !isPdf(f));

			if (pdfFiles.length > 0) {
				const pdfImages = (
					await Promise.all(pdfFiles.map((pdf) => pdfToImageFiles(pdf)))
				).flat();
				setUploadedImages((prev) => [...prev, ...pdfImages]);
			}

			if (imageFiles.length === 0) return;

			const dt = new DataTransfer();
			for (const f of imageFiles) dt.items.add(f);

			setUploadedImages((current) => {
				const newImages = buildImageFiles(dt.files, current, allowDuplicates);
				const successCount = newImages.filter((img) => !img.error).length;
				logger.trackFileOperation(
					"upload completed",
					successCount,
					newImages.reduce((t, img) => t + img.file.size, 0),
				);
				return [...current, ...newImages];
			});
		},
		[allowDuplicates],
	);

	const removeImage = useCallback((imageId: string) => {
		setUploadedImages((prev) =>
			prev.filter((image) => {
				if (image.id !== imageId) return true;
				if (image.preview) revokeImagePreview(image.preview);
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
			for (const img of prev) if (img.preview) revokeImagePreview(img.preview);
			storageService
				.clearAll()
				.catch((err) => logger.error("Failed to clear IndexedDB", err));
			return [];
		});
		modal.closePreviewModal();
	}, [modal]);

	const handleDragOver = useCallback(() => setIsDragOver(true), []);
	const handleDragLeave = useCallback(() => setIsDragOver(false), []);

	const handleDrop = useCallback(
		(files: FileList) => {
			setIsDragOver(false);
			if (files.length > 0) processUploadedFiles(files);
		},
		[processUploadedFiles],
	);

	const handleFileSelect = useCallback(
		(files: FileList | null) => {
			if (files?.length) processUploadedFiles(files);
		},
		[processUploadedFiles],
	);

	const updateImages = useCallback((images: ImageFile[]) => {
		setUploadedImages(images);
	}, []);

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
		processFiles: processUploadedFiles,
		removeImage,
		reorderImages,
		clearAllImages,
		updateImages,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
		...modal,
	};
}
