import { useImageWorkflow } from "../hooks/useImageWorkflow";
import { UploadArea } from "./upload/UploadArea";
import { ImagePreviewGrid } from "./preview/ImagePreviewGrid";
import { ImagePreviewModal } from "./preview/ImagePreviewModal";
import { CompressionControls } from "./compression/CompressionControls";
import { ExportSection } from "./export/ExportSection";

export function ImageUploader() {
	const {
		uploadedImages,
		isDragOver,
		allowDuplicates,
		setAllowDuplicates,
		reorderImages,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
		handleRemoveImage,
		previewModal,
		openPreviewModal,
		closePreviewModal,
		setPreviewImage,
		isCompressing,
		compressionError,
		currentPreset,
		compressionProgress,
		formattedStats,
		hasSignificantSavings,
		clearCompressionError,
		currentPresetCached,
		handleCompress,
		handlePresetChange,
		isGenerating,
		isSharing,
		exportError,
		clearExportError,
		shareResult,
		clearShareResult,
		filename,
		setFilename,
		previewFilename,
		lastPdfSize,
		exportToPDF,
		shareToPDF,
	} = useImageWorkflow();

	const hasImages = uploadedImages.length > 0;

	return (
		<div className="w-full space-y-4">
			<UploadArea
				isDragOver={isDragOver}
				onDragOver={(_e) => handleDragOver()}
				onDragLeave={(_e) => handleDragLeave()}
				onDrop={(e) => {
					const files = e.dataTransfer.files;
					if (files) handleDrop(files);
				}}
				onFileSelect={(e) => handleFileSelect(e.target.files)}
			/>

			<div className="flex items-center justify-end">
				<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
					<input
						type="checkbox"
						checked={allowDuplicates}
						onChange={(e) => setAllowDuplicates(e.target.checked)}
						className="rounded border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
					Permitir duplicadas
				</label>
			</div>

			{hasImages && (
				<ImagePreviewGrid
					uploadedImages={uploadedImages}
					onRemoveImage={handleRemoveImage}
					onReorderImages={reorderImages}
					onPreviewImage={openPreviewModal}
				/>
			)}

			{hasImages && (
				<CompressionControls
					isCompressing={isCompressing}
					compressionError={compressionError}
					currentPreset={currentPreset}
					compressionProgress={compressionProgress}
					formattedStats={formattedStats}
					hasSignificantSavings={hasSignificantSavings}
					isPresetCached={currentPresetCached}
					onCompress={handleCompress}
					onPresetChange={handlePresetChange}
					onClearError={clearCompressionError}
				/>
			)}

			{hasImages && (
				<ExportSection
					isGenerating={isGenerating}
					isSharing={isSharing}
					exportError={exportError}
					shareResult={shareResult}
					filename={filename}
					previewFilename={previewFilename}
					lastPdfSize={lastPdfSize}
					setFilename={setFilename}
					onExport={exportToPDF}
					onShare={shareToPDF}
					onClearError={clearExportError}
					onClearShareResult={clearShareResult}
				/>
			)}

			<ImagePreviewModal
				images={uploadedImages}
				currentIndex={previewModal.currentIndex}
				isOpen={previewModal.isOpen}
				onClose={closePreviewModal}
				onImageSelect={setPreviewImage}
			/>
		</div>
	);
}
