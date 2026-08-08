import { AlertCircle, CheckSquare, Lock, Square, Trash2, X } from "lucide-react";
import { useWorkflow, WorkflowProvider } from "../context/WorkflowContext";
import { useLicenseContext } from "../context/LicenseContext";
import { UploadArea } from "./upload/UploadArea";
import { ImagePreviewGrid } from "./preview/ImagePreviewGrid";
import { ImagePreviewModal } from "./preview/ImagePreviewModal";
import { CompressionControls } from "./compression/CompressionControls";
import { ExportSection } from "./export/ExportSection";
import { FREE_IMAGE_LIMIT } from "../services/license/licenseService";

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
	const { upload, preview, selection } = useWorkflow();
	const license = useLicenseContext();
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
	const { selectedIds, toggle, selectAll, selectNone } = selection;

	const hasImages = images.length > 0;
	const selectedCount = selectedIds.size;
	const allSelected = selectedCount === images.length && images.length > 0;
	const atLimit = !license.info.isPremium && images.length >= FREE_IMAGE_LIMIT;

	return (
		<div className="w-full space-y-4">
			<UploadArea
				isDragOver={isDragOver}
				isProcessing={isProcessing}
				disabled={atLimit}
				onDragOver={() => !atLimit && handleDragOver()}
				onDragLeave={() => handleDragLeave()}
				onDrop={(e) => !atLimit && handleDrop(e.dataTransfer.files)}
				onFileSelect={(e) => !atLimit && handleFileSelect(e.target.files)}
			/>

			{atLimit && (
				<div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
					<Lock className="h-4 w-4 shrink-0" />
					<span className="flex-1">
						Límite de {FREE_IMAGE_LIMIT} imágenes en plan gratuito.
					</span>
					<button
						type="button"
						onClick={license.openPaywall}
						className="font-medium underline underline-offset-2 hover:opacity-80"
					>
						Obtener más
					</button>
				</div>
			)}

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
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<button
						type="button"
						onClick={allSelected ? selectNone : selectAll}
						className="flex items-center gap-1.5 hover:text-foreground transition-colors"
					>
						{allSelected ? (
							<CheckSquare className="h-3.5 w-3.5" />
						) : (
							<Square className="h-3.5 w-3.5" />
						)}
						{allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
					</button>
					{selectedCount > 0 && (
						<span className="text-primary font-medium">
							{selectedCount} de {images.length} seleccionadas → exportar
						</span>
					)}
				</div>
			)}

			{hasImages && (
				<ImagePreviewGrid
					uploadedImages={images}
					selectedIds={selectedIds}
					onToggleSelect={toggle}
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
