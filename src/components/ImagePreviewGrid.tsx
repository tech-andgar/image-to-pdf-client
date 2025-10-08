import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageFile } from "../types/image";

interface ImagePreviewGridProps {
	uploadedImages: ImageFile[];
	onRemoveImage: (index: number) => void;
}

export function ImagePreviewGrid({
	uploadedImages,
	onRemoveImage,
}: ImagePreviewGridProps) {
	if (uploadedImages.length === 0) {
		return null;
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{uploadedImages.map((image, index) => (
				<div
					key={`${image.file.name}-${image.file.size}-${index}`}
					className="relative group"
				>
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
									onClick={() => onRemoveImage(index)}
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
								<p className="text-xs text-destructive/75">{image.error}</p>
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
