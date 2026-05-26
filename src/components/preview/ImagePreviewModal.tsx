import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect } from "react";

import type { ImageFile } from "../types/image";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

interface ImagePreviewModalProps {
	images: ImageFile[];
	currentIndex: number | null;
	isOpen: boolean;
	onClose: () => void;
	onImageSelect?: (index: number) => void;
}

export function ImagePreviewModal({
	images,
	currentIndex,
	isOpen,
	onClose,
	onImageSelect,
}: Readonly<ImagePreviewModalProps>) {
	const currentImage = currentIndex !== null ? images[currentIndex] : null;
	const hasMultipleImages = images.length > 1;

	// Navigation functions
	const navigateToPrevious = useCallback(() => {
		if (currentIndex === null || images.length === 0) return;

		const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
		if (onImageSelect) {
			onImageSelect(prevIndex);
		}
	}, [currentIndex, images.length, onImageSelect]);

	const navigateToNext = useCallback(() => {
		if (currentIndex === null || images.length === 0) return;

		const nextIndex = (currentIndex + 1) % images.length;
		if (onImageSelect) {
			onImageSelect(nextIndex);
		}
	}, [currentIndex, images.length, onImageSelect]);

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (!isOpen || currentIndex === null) return;

			switch (event.key) {
				case "ArrowLeft":
				case "ArrowUp":
					event.preventDefault();
					navigateToPrevious();
					break;
				case "ArrowRight":
				case "ArrowDown":
					event.preventDefault();
					navigateToNext();
					break;
				case "Escape":
					event.preventDefault();
					onClose();
					break;
				case "Enter":
				case " ":
					event.preventDefault();
					if (onImageSelect) {
						onImageSelect(currentIndex);
					}
					break;
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyPress);
			return () => document.removeEventListener("keydown", handleKeyPress);
		}
	}, [
		isOpen,
		currentIndex,
		onClose,
		onImageSelect,
		navigateToPrevious,
		navigateToNext,
	]);

	if (!currentImage) return null;

	const validImages = images.filter((img) => img.preview && !img.error);
	const currentDisplayIndex =
		validImages.findIndex((img) => img.id === currentImage.id) + 1;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl w-full h-full max-h-[90vh] p-0 overflow-hidden">
				<DialogHeader className="sr-only">
					<DialogTitle>Preview de imagen</DialogTitle>
					<DialogDescription>
						Imagen {currentDisplayIndex} de {validImages.length}
					</DialogDescription>
				</DialogHeader>

				{/* Navigation buttons */}
				{hasMultipleImages && (
					<>
						<Button
							variant="ghost"
							size="icon"
							className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-black/20 text-white hover:bg-black/40 rounded-full w-12 h-12"
							onClick={navigateToPrevious}
						>
							<ChevronLeft className="h-6 w-6" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 bg-black/20 text-white hover:bg-black/40 rounded-full w-12 h-12"
							onClick={navigateToNext}
						>
							<ChevronRight className="h-6 w-6" />
						</Button>
					</>
				)}

				{/* Main content - Full screen image */}
				<div className="flex flex-col h-full">
					{/* Full screen image container - no padding, no background */}
					<div className="flex-1 flex items-center justify-center">
						{currentImage.preview ? (
							<img
								src={currentImage.preview}
								alt={`${currentImage.file.name} - Preview ${currentDisplayIndex} de ${validImages.length}`}
								className="w-full h-full object-contain"
							/>
						) : (
							<div className="text-center text-white">
								<p className="text-lg">Error: {currentImage.error}</p>
							</div>
						)}
					</div>

					{/* Footer with image info */}
					<div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-6 py-4">
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span className="font-medium truncate max-w-xs">
								{currentImage.file.name}
							</span>
							{hasMultipleImages && (
								<span>
									{currentDisplayIndex} de {validImages.length}
								</span>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
