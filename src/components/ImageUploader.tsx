import { Upload, FileDown, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "../hooks/useImageUpload";
import { usePdfExport } from "../hooks/usePdfExport";
import { useImageCompression } from "../hooks/useImageCompression";
import { UploadArea } from "./UploadArea";
import { ImagePreviewGrid } from "./ImagePreviewGrid";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { CompressionControls } from "./CompressionControls";

export function ImageUploader() {
	const {
		uploadedImages,
		isDragOver,
		removeImage,
		reorderImages,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
		// Preview modal state and functions
		previewModal,
		openPreviewModal,
		closePreviewModal,
		setPreviewImage,
	} = useImageUpload();

	const { isGenerating, exportError, exportToPDF, clearExportError } =
		usePdfExport();

	const {
		isCompressing,
		compressionError,
		currentPreset,
		compressionProgress,
		compressionStats,
		formattedStats,
		hasSignificantSavings,
		presets,
		compressImages,
		changePreset,
		clearError: clearCompressionError,
	} = useImageCompression();

	return (
		<div className="w-full max-w-2xl mx-auto">
			<Card className="mx-auto max-w-none">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Cargar Imágenes
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Debug info */}
					<div className="mb-4 p-2 bg-muted rounded">
						<p className="text-sm">
							Debug: {uploadedImages.length} imágenes cargadas
						</p>
					</div>

					{/* Upload Area */}
					<UploadArea
						isDragOver={isDragOver}
						onDragOver={(_e) => handleDragOver()}
						onDragLeave={(_e) => handleDragLeave()}
						onDrop={(e) => {
							const files = e.dataTransfer.files;
							if (files) handleDrop(files);
						}}
						onFileSelect={(e) => {
							const files = e.target.files;
							handleFileSelect(files);
						}}
					/>



					{/* Compression Controls */}
					{uploadedImages.length > 0 && (
						<div className="mb-6">
							<CompressionControls
								isCompressing={isCompressing}
								compressionError={compressionError}
								currentPreset={currentPreset}
								compressionProgress={compressionProgress}
								formattedStats={formattedStats}
								hasSignificantSavings={hasSignificantSavings}
								presets={presets}
								onCompress={() => compressImages(uploadedImages)}
								onPresetChange={changePreset}
								onClearError={clearCompressionError}
							/>
						</div>
					)}

					{/* Image Previews */}
					<ImagePreviewGrid
						uploadedImages={uploadedImages}
						onRemoveImage={removeImage}
						onReorderImages={reorderImages}
						onPreviewImage={openPreviewModal}
					/>

					{/* Export to PDF Section */}
					{uploadedImages.length > 0 && (
						<div className="mt-6 p-4 border rounded-lg bg-muted/30">
							<h3 className="text-sm font-medium mb-3 flex items-center gap-2">
								<FileDown className="h-4 w-4" />
								Exportar a PDF
							</h3>

							{/* Error message */}
							{exportError && (
								<div className="mb-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
									<AlertCircle className="h-4 w-4 flex-shrink-0" />
									<span>{exportError}</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={clearExportError}
										className="ml-auto h-6 px-2 text-red-600 hover:text-red-800"
									>
										✕
									</Button>
								</div>
							)}

							{/* Export button */}
							<Button
								onClick={() => exportToPDF(uploadedImages)}
								disabled={isGenerating || uploadedImages.length === 0}
								className="w-full"
								size="lg"
							>
								{isGenerating ? (
									<>Generando PDF...</>
								) : (
									<>
										<FileDown className="h-4 w-4 mr-2" />
										Descargar PDF ({uploadedImages.length} página
										{uploadedImages.length !== 1 ? "s" : ""})
									</>
								)}
							</Button>

							<div className="mt-2 text-xs text-muted-foreground">
								Las imágenes serán exportadas en el orden actual
							</div>
						</div>
					)}

					{/* Instructions */}
					<div className="text-sm text-muted-foreground mt-4">
						<p className="font-medium mb-2">Archivos aceptados:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>JPEG, PNG, BMP, GIF</li>
							<li>Máximo 10MB por archivo</li>
							<li>Múltiples archivos permitidos</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			{/* Preview Modal */}
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
