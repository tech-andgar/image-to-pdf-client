import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImageUpload } from "../hooks/useImageUpload";
import { UploadArea } from "./UploadArea";
import { ImagePreviewGrid } from "./ImagePreviewGrid";

export function ImageUploader() {
	const {
		uploadedImages,
		isDragOver,
		removeImage,
		clearAllImages,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
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
					{/* Upload Area */}
					<UploadArea
						isDragOver={isDragOver}
						onDragOver={(e) => handleDragOver()}
						onDragLeave={(e) => handleDragLeave()}
						onDrop={(e) => {
							const files = e.dataTransfer.files;
							if (files) handleDrop(files);
						}}
						onFileSelect={(e) => {
							const files = e.target.files;
							handleFileSelect(files);
						}}
					/>

					{/* Image Previews */}
					<ImagePreviewGrid
						uploadedImages={uploadedImages}
						onRemoveImage={removeImage}
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
		</div>
	);
}
