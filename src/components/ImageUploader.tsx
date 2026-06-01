import { AlertCircle, Trash2, X } from "lucide-react";
import { useWorkflow, WorkflowProvider } from "../context/WorkflowContext";
import { UploadArea } from "./upload/UploadArea";
import { ImagePreviewGrid } from "./preview/ImagePreviewGrid";
import { ImagePreviewModal } from "./preview/ImagePreviewModal";
import { CompressionControls } from "./compression/CompressionControls";
import { ExportSection } from "./export/ExportSection";

function UploadErrorBanner() {
	const { upload } = useWorkflow();
	const { uploadError, clearUploadError } = upload;
	if (!uploadError) return null;
	return (
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
	);
}

function AllowDuplicatesToggle() {
	const { upload } = useWorkflow();
	const { allowDuplicates, setAllowDuplicates } = upload;
	return (
		<label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
			<input
				type="checkbox"
				checked={allowDuplicates}
				onChange={(e) => setAllowDuplicates(e.target.checked)}
				className="rounded border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
			/>
			Permitir duplicadas
		</label>
	);
}

function ImageUploaderContent() {
	const { upload, preview } = useWorkflow();
	const {
		images,
		isDragOver,
		isProcessing,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
		reorderImages,
		handleRemoveImage,
		clearAllImages,
	} = upload;
	const {
		modal: previewModal,
		open: openPreviewModal,
		close: closePreviewModal,
		setImage: setPreviewImage,
	} = preview;

	const hasImages = images.length > 0;

	return (
		<div className="w-full space-y-4">
			<UploadArea
				isDragOver={isDragOver}
				isProcessing={isProcessing}
				onDragOver={() => handleDragOver()}
				onDragLeave={() => handleDragLeave()}
				onDrop={(e) => handleDrop(e.dataTransfer.files)}
				onFileSelect={(e) => handleFileSelect(e.target.files)}
			/>

			<UploadErrorBanner />

			<div className="flex items-center justify-between">
				<AllowDuplicatesToggle />
				{hasImages && (
					<button
						type="button"
						onClick={clearAllImages}
						className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
					>
						<Trash2 className="h-3.5 w-3.5" />
						Limpiar todo
					</button>
				)}
			</div>

			{hasImages && (
				<ImagePreviewGrid
					uploadedImages={images}
					onRemoveImage={handleRemoveImage}
					onReorderImages={reorderImages}
					onPreviewImage={openPreviewModal}
				/>
			)}

			{hasImages && <CompressionControls />}

			{hasImages && <ExportSection />}

			<ImagePreviewModal
				images={images}
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
