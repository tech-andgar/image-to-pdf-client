import { Activity, Upload, FileDown, AlertCircle, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useImageWorkflow } from "../hooks/useImageWorkflow";
import { useTheme } from "../hooks/useTheme";
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

	const { theme, isDark } = useTheme();

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
					{/* Debug info - only show in development */}
					{import.meta.env.DEV && (
						<div className="mb-4 p-2 bg-muted rounded flex items-center gap-2">
							<Activity className="h-4 w-4" />
							<p className="text-sm">
								Debug: {uploadedImages.length} imágenes cargadas | Tema: {theme}{" "}
								({isDark ? "Dark Mode" : "Light Mode"})
							</p>
						</div>
					)}

					{/* Upload Area */}
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

					{/* Duplicate Files Toggle */}
					<div className="mb-4 flex items-center justify-center space-x-2">
						<label className="flex items-center space-x-2 text-sm text-muted-foreground cursor-pointer">
							<input
								type="checkbox"
								checked={allowDuplicates}
								onChange={(e) => setAllowDuplicates(e.target.checked)}
								className="rounded border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
							/>
							<span>Permitir imágenes duplicadas</span>
						</label>
					</div>

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
								onCompress={handleCompress}
								onPresetChange={handlePresetChange}
								onClearError={clearCompressionError}
							/>
						</div>
					)}

					{/* Image Previews */}
					<ImagePreviewGrid
						uploadedImages={uploadedImages}
						onRemoveImage={handleRemoveImage}
						onReorderImages={reorderImages}
						onPreviewImage={openPreviewModal}
					/>

					{/* Export to PDF Section */}
					{uploadedImages.length > 0 && (
						<div className="mt-6 p-4 border rounded-lg bg-muted/30">
							<h2 className="text-sm font-medium mb-3 flex items-center gap-2">
								<FileDown className="h-4 w-4" />
								Exportar a PDF
							</h2>

							{/* Filename Input Component - Single Responsibility */}
							<FilenameInput
								filename={filename}
								setFilename={setFilename}
								previewFilename={previewFilename}
							/>

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

							{/* Export buttons */}
							<div className="grid grid-cols-2 gap-3">
								<Button
									onClick={exportToPDF}
									disabled={isGenerating || uploadedImages.length === 0}
									size="lg"
								>
									{isGenerating ? (
										<>Generando...</>
									) : (
										<>
											<FileDown className="h-4 w-4 mr-2" />
											Descargar
										</>
									)}
								</Button>

								<Button
									onClick={shareToPDF}
									disabled={isSharing || uploadedImages.length === 0}
									variant="outline"
									size="lg"
								>
									{isSharing ? (
										<>Compartiendo...</>
									) : (
										<>
											<Share2 className="h-4 w-4 mr-2" />
											Compartir
										</>
									)}
								</Button>
							</div>

							{/* Share result message */}
							{shareResult && (
								<div
									className={`mt-3 p-2 rounded flex items-center gap-2 text-sm ${
										shareResult.success
											? "bg-green-50 border border-green-200 text-green-700"
											: "bg-yellow-50 border border-yellow-200 text-yellow-700"
									}`}
								>
									<AlertCircle
										className={`h-4 w-4 flex-shrink-0 ${
											shareResult.success ? "text-green-600" : "text-yellow-600"
										}`}
									/>
									<span className="flex-1">
										{shareResult.success
											? `Compartido exitosamente ${shareResult.method === "file" ? "(archivo)" : shareResult.method === "url" ? "(enlace)" : ""}`
											: shareResult.error}
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={clearShareResult}
										className={`ml-auto h-6 px-2 ${
											shareResult.success
												? "text-green-600 hover:text-green-800 hover:bg-green-100"
												: "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
										}`}
									>
										✕
									</Button>
								</div>
							)}

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
