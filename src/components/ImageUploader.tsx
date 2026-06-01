import { AlertCircle, X } from "lucide-react";
import { useWorkflow, WorkflowProvider } from "../context/WorkflowContext";
import { UploadArea } from "./upload/UploadArea";
import { ImagePreviewGrid } from "./preview/ImagePreviewGrid";
import { ImagePreviewModal } from "./preview/ImagePreviewModal";
import { CompressionControls } from "./compression/CompressionControls";
import { ExportSection } from "./export/ExportSection";

function ImageUploaderContent() {
	const {
		uploadedImages,
		isDragOver,
		isProcessing,
		allowDuplicates,
		setAllowDuplicates,
		uploadError,
		clearUploadError,
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
	} = useWorkflow();

	const hasImages = uploadedImages.length > 0;

	return (
		<div className="w-full space-y-4">
			<UploadArea
				isDragOver={isDragOver}
				isProcessing={isProcessing}
				onDragOver={(_e) => handleDragOver()}
				onDragLeave={(_e) => handleDragLeave()}
				onDrop={(e) => {
					const files = e.dataTransfer.files;
					if (files) handleDrop(files);
				}}
				onFileSelect={(e) => handleFileSelect(e.target.files)}
			/>

			{uploadError && (
				<div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
					<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
					<span className="flex-1">{uploadError}</span>
					<button
						type="button"
						onClick={clearUploadError}
						className="opacity-60 hover:opacity-100"
						aria-label="Cerrar"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</div>
			)}

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

			{hasImages && <CompressionControls />}

			{hasImages && <ExportSection />}

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

export function ImageUploader() {
	return (
		<WorkflowProvider>
			<ImageUploaderContent />
		</WorkflowProvider>
	);
}
