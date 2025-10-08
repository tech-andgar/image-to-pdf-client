import { Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadArea } from "./UploadArea";
import { ImagePreviewGrid, type ImageFile } from "./ImagePreviewGrid";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageUploader() {
	const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);

	const validateFile = (file: File): string | null => {
		if (!ACCEPTED_TYPES.includes(file.type)) {
			return "Tipo de archivo no válido. Solo se aceptan JPEG, PNG, BMP y GIF.";
		}
		if (file.size > MAX_FILE_SIZE) {
			return "El archivo es demasiado grande. El límite es 10MB.";
		}
		return null;
	};

	const processFiles = (files: FileList) => {
		const newImages: ImageFile[] = [];

		Array.from(files).forEach((file) => {
			const error = validateFile(file);
			if (error) {
				newImages.push({
					file,
					preview: "",
					error,
				});
			} else {
				const preview = URL.createObjectURL(file);
				newImages.push({
					file,
					preview,
				});
			}
		});

		setUploadedImages((prev) => [...prev, ...newImages]);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);
		const files = e.dataTransfer.files;
		if (files) {
			processFiles(files);
		}
	};

	const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files) {
			processFiles(files);
		}
	};

	const removeImage = (index: number) => {
		setUploadedImages((prev) => {
			const newImages = [...prev];
			const removed = newImages.splice(index, 1)[0];
			if (removed.preview) {
				URL.revokeObjectURL(removed.preview);
			}
			return newImages;
		});
	};

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
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onFileSelect={handleFileSelect}
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

export type { ImageFile };
