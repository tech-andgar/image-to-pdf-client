import { AlertCircle, Upload, X } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageFile {
	file: File;
	preview: string;
	error?: string;
}

export function ImageUploader() {
	const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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
		<div className="w-full max-w-2xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Cargar Imágenes
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Upload Area */}
					<div
						className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
							isDragOver
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25"
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						<Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<h3 className="text-lg font-medium mb-2">
							Arrastra las imágenes aquí
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							o haz clic para seleccionar archivos
						</p>
						<Button
							onClick={() => fileInputRef.current?.click()}
							variant="outline"
						>
							Seleccionar Archivos
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							multiple
							accept="image/jpeg,image/png,image/bmp,image/gif"
							onChange={handleFileSelect}
							className="hidden"
						/>
					</div>

					{/* Image Previews */}
					{uploadedImages.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{uploadedImages.map((image, index) => (
								<div key={`${image.file.name}-${image.file.size}-${index}`} className="relative group">
									{image.preview ? (
										<div className="aspect-square rounded-lg overflow-hidden bg-muted">
											<img
												src={image.preview}
												alt={image.file.name}
												className="w-full h-full object-cover"
											/>
											<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
												<Button
													variant="destructive"
													size="sm"
													className="opacity-0 group-hover:opacity-100"
													onClick={() => removeImage(index)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									) : (
										<div className="aspect-square rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
											<div className="text-center p-2">
												<AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
												<p className="text-xs text-destructive font-medium">
													{image.file.name}
												</p>
												<p className="text-xs text-destructive/75">
													{image.error}
												</p>
											</div>
										</div>
									)}
								</div>
							))}
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
		</div>
	);
}
