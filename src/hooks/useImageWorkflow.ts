import { useImageUpload } from "./upload/useImageUpload";
import { usePdfExport } from "./export/usePdfExport";
import { useImageCompression } from "./compression/useImageCompression";
import type { CompressionPreset } from "../types/image";

export function useImageWorkflow() {
	const upload = useImageUpload();
	const export_ = usePdfExport();
	const compression = useImageCompression();

	async function handleCompress() {
		const compressed = await compression.compressImages(upload.uploadedImages);
		upload.updateImages(compressed);
	}

	async function handlePresetChange(preset: CompressionPreset) {
		const originals = compression.originalImages ?? upload.uploadedImages;
		compression.changePreset(preset);
		compression.resetCompressionState();
		upload.updateImages(originals);

		if (compression.isPresetCached(originals, preset)) {
			const compressed = await compression.compressImages(originals, preset);
			upload.updateImages(compressed);
		}
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

	const currentPresetCached = compression.isPresetCached(
		upload.uploadedImages,
		compression.currentPreset,
	);

	const allPdfSourced =
		upload.uploadedImages.length > 0 &&
		upload.uploadedImages.every((img) => !!img.pdfSource);

	return {
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
		previewModal: upload.previewModal,
		openPreviewModal: upload.openPreviewModal,
		closePreviewModal: upload.closePreviewModal,
		setPreviewImage: upload.setPreviewImage,
		isCompressing: compression.isCompressing,
		compressionError: compression.compressionError,
		currentPreset: compression.currentPreset,
		compressionProgress: compression.compressionProgress,
		formattedStats: compression.formattedStats,
		hasSignificantSavings: compression.hasSignificantSavings,
		clearCompressionError: compression.clearError,
		currentPresetCached,
		allPdfSourced,
		handleCompress,
		handlePresetChange,
		isGenerating: export_.isGenerating,
		isSharing: export_.isSharing,
		exportError: export_.exportError,
		clearExportError: export_.clearExportError,
		shareResult: export_.shareResult,
		clearShareResult: export_.clearShareResult,
		filename: export_.filename,
		setFilename: export_.setFilename,
		previewFilename: export_.previewFilename,
		lastPdfSize: export_.lastPdfSize,
		exportToPDF: () =>
			export_.exportToPDF(upload.uploadedImages, compression.currentPreset),
		shareToPDF: () =>
			export_.shareToPDF(upload.uploadedImages, compression.currentPreset),
	};
}
