import { useCallback } from "react";
import { useImageUpload } from "./upload/useImageUpload";
import { usePdfExport } from "./export/usePdfExport";
import { useImageCompression } from "./compression/useImageCompression";
import { usePreviewModal } from "./preview/usePreviewModal";
import type { CompressionPreset } from "../types/image";

export function useImageWorkflow() {
	const upload = useImageUpload();
	const export_ = usePdfExport();
	const compression = useImageCompression();
	const modal = usePreviewModal();

	const handleCompress = useCallback(async () => {
		const compressed = await compression.compressImages(upload.uploadedImages);
		upload.updateImages(compressed);
	}, [compression, upload]);

	const handlePresetChange = useCallback(
		async (preset: CompressionPreset) => {
			const originals = compression.originalImages ?? upload.uploadedImages;
			compression.changePreset(preset);
			compression.resetCompressionState();
			upload.updateImages(originals);
			if (compression.isPresetCached(originals, preset)) {
				const compressed = await compression.compressImages(originals, preset);
				upload.updateImages(compressed);
			}
		},
		[compression, upload],
	);

	const handleDrop = useCallback(
		(files: FileList) => {
			upload.handleDrop(files);
			compression.resetCompression();
		},
		[upload, compression],
	);

	const handleFileSelect = useCallback(
		(files: FileList | null) => {
			upload.handleFileSelect(files);
			compression.resetCompression();
		},
		[upload, compression],
	);

	const handleRemoveImage = useCallback(
		(id: string) => {
			upload.removeImage(id);
			compression.resetCompression();
		},
		[upload, compression],
	);

	const clearAllImages = useCallback(() => {
		upload.clearAllImages();
		compression.resetCompression();
	}, [upload, compression]);

	const exportToPDF = useCallback(
		() => export_.exportToPDF(upload.uploadedImages, compression.currentPreset),
		[export_, upload.uploadedImages, compression.currentPreset],
	);

	const shareToPDF = useCallback(
		() => export_.shareToPDF(upload.uploadedImages, compression.currentPreset),
		[export_, upload.uploadedImages, compression.currentPreset],
	);

	const allPdfSourced =
		upload.uploadedImages.length > 0 &&
		upload.uploadedImages.every((img) => !!img.pdfSource);

	return {
		upload: {
			images: upload.uploadedImages,
			isDragOver: upload.isDragOver,
			isProcessing: upload.isProcessing,
			allowDuplicates: upload.allowDuplicates,
			setAllowDuplicates: upload.setAllowDuplicates,
			uploadError: upload.uploadError,
			clearUploadError: upload.clearUploadError,
			reorderImages: upload.reorderImages,
			handleDragOver: upload.handleDragOver,
			handleDragLeave: upload.handleDragLeave,
			handleDrop,
			handleFileSelect,
			handleRemoveImage,
			clearAllImages,
		},
		preview: {
			modal: modal.previewModal,
			open: modal.openPreviewModal,
			close: modal.closePreviewModal,
			setImage: modal.setPreviewImage,
		},
		compression: {
			isCompressing: compression.isCompressing,
			error: compression.compressionError,
			clearError: compression.clearError,
			currentPreset: compression.currentPreset,
			progress: compression.compressionProgress,
			formattedStats: compression.formattedStats,
			hasSignificantSavings: compression.hasSignificantSavings,
			currentPresetCached: compression.isPresetCached(
				upload.uploadedImages,
				compression.currentPreset,
			),
			allPdfSourced,
			handleCompress,
			handlePresetChange,
		},
		export: {
			isGenerating: export_.isGenerating,
			isLoadingLibrary: export_.isLoadingLibrary,
			isSharing: export_.isSharing,
			error: export_.exportError,
			clearError: export_.clearExportError,
			shareResult: export_.shareResult,
			clearShareResult: export_.clearShareResult,
			filename: export_.filename,
			setFilename: export_.setFilename,
			previewFilename: export_.previewFilename,
			lastPdfSize: export_.lastPdfSize,
			exportToPDF,
			shareToPDF,
		},
	};
}

export type WorkflowState = ReturnType<typeof useImageWorkflow>;
