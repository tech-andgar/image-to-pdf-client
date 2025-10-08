import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImageUpload } from "../hooks/useImageUpload";
import { UploadArea } from "./UploadArea";
import { ImagePreviewGrid } from "./ImagePreviewGrid";
import { ImagePreviewModal } from "./ImagePreviewModal";

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

					{/* Test Click Component */}
					<div className="mb-4 p-4 border-2 border-blue-500 rounded">
						<h3 className="text-sm font-bold mb-2">Test Click Component:</h3>
						<button
							type="button"
							className="w-32 h-32 bg-red-500 cursor-pointer border-0"
							onClick={() => console.log("TEST CLICK WORKS!")}
						>
							Click me - test básico
						</button>
					</div>

					{/* Image Previews */}
					<ImagePreviewGrid
						uploadedImages={uploadedImages}
						onRemoveImage={removeImage}
						onReorderImages={reorderImages}
						onPreviewImage={openPreviewModal}
					/>

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
