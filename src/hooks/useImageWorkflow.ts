import { useImageUpload } from "./useImageUpload";
import { usePdfExport } from "./usePdfExport";
import { useImageCompression } from "./useImageCompression";

export function useImageWorkflow() {
	const upload = useImageUpload();
	const export_ = usePdfExport();
	const compression = useImageCompression();

	function resetCompressionState() {
		compression.resetCompression();
		upload.updateImages(upload.uploadedImages);
	}

	async function handleCompress() {
		const compressed = await compression.compressImages(upload.uploadedImages);
		upload.updateImages(compressed);
	}

	function handlePresetChange(
		preset: Parameters<typeof compression.changePreset>[0],
	) {
		compression.changePreset(preset);
		compression.resetCompression();
		upload.updateImages(compression.originalImages ?? upload.uploadedImages);
	}

	function handleDrop(files: FileList) {
		upload.handleDrop(files);
		compression.resetCompression();
	}

	function handleFileSelect(files: FileList | null) {
		upload.handleFileSelect(files);
		compression.resetCompression();
	}

	function handleRemoveImage(id: string) {
		upload.removeImage(id);
		compression.resetCompression();
	}

	return {
		// upload state
		uploadedImages: upload.uploadedImages,
		isDragOver: upload.isDragOver,
		allowDuplicates: upload.allowDuplicates,
		setAllowDuplicates: upload.setAllowDuplicates,
		reorderImages: upload.reorderImages,
		handleDragOver: upload.handleDragOver,
		handleDragLeave: upload.handleDragLeave,
		handleDrop,
		handleFileSelect,
		handleRemoveImage,
		// preview modal
		previewModal: upload.previewModal,
		openPreviewModal: upload.openPreviewModal,
		closePreviewModal: upload.closePreviewModal,
		setPreviewImage: upload.setPreviewImage,
		// compression
		isCompressing: compression.isCompressing,
		compressionError: compression.compressionError,
		currentPreset: compression.currentPreset,
		compressionProgress: compression.compressionProgress,
		formattedStats: compression.formattedStats,
		hasSignificantSavings: compression.hasSignificantSavings,
		clearCompressionError: compression.clearError,
		handleCompress,
		handlePresetChange,
		// export
		isGenerating: export_.isGenerating,
		isSharing: export_.isSharing,
		exportError: export_.exportError,
		clearExportError: export_.clearExportError,
		shareResult: export_.shareResult,
		clearShareResult: export_.clearShareResult,
		filename: export_.filename,
		setFilename: export_.setFilename,
		previewFilename: export_.previewFilename,
		exportToPDF: () => export_.exportToPDF(upload.uploadedImages),
		shareToPDF: () => export_.shareToPDF(upload.uploadedImages),
	};
}
