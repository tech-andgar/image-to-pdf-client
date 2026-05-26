import { FileDown, AlertCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageWorkflow } from "../hooks/useImageWorkflow";
import { UploadArea } from "./upload/UploadArea";
import { ImagePreviewGrid } from "./preview/ImagePreviewGrid";
import { ImagePreviewModal } from "./preview/ImagePreviewModal";
import { CompressionControls } from "./compression/CompressionControls";
import { FilenameInput } from "./export/FilenameInput";

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
		exportToPDF,
		shareToPDF,
	} = useImageWorkflow();

	const hasImages = uploadedImages.length > 0;

	return (
		<div className="w-full space-y-4">
			{/* Upload */}
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

			{/* Duplicate toggle */}
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

			{/* Image grid */}
			{hasImages && (
				<ImagePreviewGrid
					uploadedImages={uploadedImages}
					onRemoveImage={handleRemoveImage}
					onReorderImages={reorderImages}
					onPreviewImage={openPreviewModal}
				/>
			)}

			{/* Compression */}
			{hasImages && (
				<CompressionControls
					isCompressing={isCompressing}
					compressionError={compressionError}
					currentPreset={currentPreset}
					compressionProgress={compressionProgress}
					formattedStats={formattedStats}
					hasSignificantSavings={hasSignificantSavings}
					onCompress={handleCompress}
					onPresetChange={handlePresetChange}
					onClearError={clearCompressionError}
				/>
			)}

			{/* Export */}
			{hasImages && (
				<div className="rounded-xl border bg-card p-4 space-y-3">
					<h2 className="text-sm font-medium flex items-center gap-2 text-foreground">
						<FileDown className="h-4 w-4" />
						Exportar a PDF
					</h2>

					<FilenameInput
						filename={filename}
						setFilename={setFilename}
						previewFilename={previewFilename}
					/>

					{exportError && (
						<div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm">
							<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
							<span className="flex-1">{exportError}</span>
							<button
								type="button"
								onClick={clearExportError}
								className="text-destructive/70 hover:text-destructive leading-none"
								aria-label="Cerrar error"
							>
								✕
							</button>
						</div>
					)}

					<div className="grid grid-cols-2 gap-2">
						<Button
							onClick={exportToPDF}
							disabled={isGenerating}
							className="w-full"
						>
							{isGenerating ? (
								"Generando…"
							) : (
								<>
									<FileDown className="h-4 w-4 mr-1.5" />
									Descargar
								</>
							)}
						</Button>

						<Button
							onClick={shareToPDF}
							disabled={isSharing}
							variant="outline"
							className="w-full"
						>
							{isSharing ? (
								"Compartiendo…"
							) : (
								<>
									<Share2 className="h-4 w-4 mr-1.5" />
									Compartir
								</>
							)}
						</Button>
					</div>

					{shareResult && (
						<div
							className={`p-2.5 rounded-lg flex items-start gap-2 text-sm border ${
								shareResult.success
									? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
									: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
							}`}
						>
							<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
							<span className="flex-1">
								{shareResult.success
									? `Compartido exitosamente${shareResult.method === "file" ? " (archivo)" : shareResult.method === "url" ? " (enlace)" : ""}`
									: shareResult.error}
							</span>
							<button
								type="button"
								onClick={clearShareResult}
								className="opacity-60 hover:opacity-100 leading-none"
								aria-label="Cerrar"
							>
								✕
							</button>
						</div>
					)}

					<p className="text-xs text-muted-foreground">
						Las imágenes se exportan en el orden actual
					</p>
				</div>
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
