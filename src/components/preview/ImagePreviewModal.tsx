import { ChevronLeft, ChevronRight, CheckSquare, Square } from "lucide-react";
import { useCallback, useEffect } from "react";
import type { ImageFile } from "../../types/image";
import { useWorkflow } from "../../context/WorkflowContext";
import { useTouchSwipe } from "../../hooks/useTouchSwipe";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

interface ImagePreviewModalProps {
	readonly images: ImageFile[];
	readonly currentIndex: number | null;
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onImageSelect?: (index: number) => void;
}

export function ImagePreviewModal({
	images,
	currentIndex,
	isOpen,
	onClose,
	onImageSelect,
}: ImagePreviewModalProps) {
	const currentImage = currentIndex !== null ? images[currentIndex] : null;
	const hasMultipleImages = images.length > 1;

	const navigateToPrevious = useCallback(() => {
		if (currentIndex === null || images.length === 0) return;
		const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
		onImageSelect?.(prevIndex);
	}, [currentIndex, images.length, onImageSelect]);

	const navigateToNext = useCallback(() => {
		if (currentIndex === null || images.length === 0) return;
		const nextIndex = (currentIndex + 1) % images.length;
		onImageSelect?.(nextIndex);
	}, [currentIndex, images.length, onImageSelect]);

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
					onImageSelect?.(currentIndex);
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

	const swipe = useTouchSwipe(navigateToNext, navigateToPrevious);

	const { selection } = useWorkflow();
	const isSelected = currentImage
		? selection.selectedIds.has(currentImage.id)
		: false;

	if (!currentImage) return null;

	const validImages = images.filter((img) => img.preview && !img.error);
	const currentDisplayIndex =
		validImages.findIndex((img) => img.id === currentImage.id) + 1;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="max-w-4xl w-[calc(100vw-2rem)] h-[90dvh] p-0 overflow-hidden flex flex-col"
				{...swipe}
			>
				<DialogHeader className="sr-only">
					<DialogTitle>Preview de imagen</DialogTitle>
					<DialogDescription>
						Imagen {currentDisplayIndex} de {validImages.length}
					</DialogDescription>
				</DialogHeader>

				{hasMultipleImages && (
					<>
						<Button
							variant="ghost"
							size="icon"
							className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-background/70 text-foreground hover:bg-background/90 rounded-full w-12 h-12 border shadow-sm"
							onClick={navigateToPrevious}
						>
							<ChevronLeft className="h-6 w-6" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 bg-background/70 text-foreground hover:bg-background/90 rounded-full w-12 h-12 border shadow-sm"
							onClick={navigateToNext}
						>
							<ChevronRight className="h-6 w-6" />
						</Button>
					</>
				)}

				<div className="flex flex-col flex-1 min-h-0">
					<div
						className="flex-1 min-h-0 flex items-center justify-center overflow-auto bg-muted/30"
						style={{ touchAction: "pinch-zoom" }}
					>
						{currentImage.preview ? (
							<img
								src={currentImage.preview}
								alt={`${currentImage.file.name} - Preview ${currentDisplayIndex} de ${validImages.length}`}
								className="max-w-full max-h-full object-contain select-none"
								draggable={false}
							/>
						) : (
							<div className="text-center text-white">
								<p className="text-lg">Error: {currentImage.error}</p>
							</div>
						)}
					</div>

					<div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-4 py-3 space-y-1.5">
						{currentImage.pdfSource && (
							<p className="text-[10px] text-muted-foreground/70 text-center truncate">
								Vista previa aproximada — el PDF exportado preserva fuentes
								originales
							</p>
						)}
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span className="font-medium truncate max-w-xs">
								{currentImage.file.name}
							</span>
							<div className="flex items-center gap-3 shrink-0">
								{hasMultipleImages && (
									<span>
										{currentDisplayIndex} de {validImages.length}
									</span>
								)}
								<button
									type="button"
									onClick={() => selection.toggle(currentImage.id)}
									className={`flex items-center gap-1.5 text-xs transition-colors ${isSelected ? "text-primary" : "hover:text-foreground"}`}
								>
									{isSelected ? (
										<CheckSquare className="h-4 w-4" />
									) : (
										<Square className="h-4 w-4" />
									)}
									{isSelected ? "Seleccionada" : "Seleccionar"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
