import { AlertCircle, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ImageFile } from "../types/image";

interface SortableImageItemProps {
	image: ImageFile;
	index: number;
	onRemoveImage: (imageId: string) => void;
	onPreviewImage: (imageIndex: number) => void;
	isDragging?: boolean;
}

/**
 * Individual sortable image item component
 * Handles drag behavior and UI presentation for a single image
 */
export function SortableImageItem({
	image,
	index,
	onRemoveImage,
	onPreviewImage,
	isDragging = false,
}: Readonly<SortableImageItemProps>) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: image.id,
			data: { index },
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`relative group rounded-lg overflow-hidden bg-muted transition-all duration-200 touch-none ${
				image.error ? "bg-destructive/10 border border-destructive/20" : ""
			} ${isDragging ? "opacity-50 scale-95 z-50" : ""}`}
			{...attributes}
		>
			{/* Drag handle - dedicated grip area (larger for mobile) */}
			<div
				className={`absolute top-2 left-2 z-10 bg-black/50 rounded p-1 md:p-1 transition-opacity touch-manipulation ${
					isDragging
						? "opacity-100"
						: "opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
				}`}
				{...listeners}
			>
				<GripVertical className="h-4 w-4 md:h-3 md:w-3 text-white" />
			</div>

			{/* Remove button - always visible on mobile, hover on desktop */}
			<div className="absolute top-2 right-2 z-10">
				<Button
					variant="destructive"
					size="sm"
					className={`w-6 h-6 md:w-5 md:h-5 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-manipulation ${
						isDragging ? "opacity-0 pointer-events-none" : ""
					}`}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						onRemoveImage(image.id);
					}}
				>
					<X className="h-4 w-4 md:h-3 md:w-3" />
				</Button>
			</div>

			{/* Image content - click handler for preview */}
			{image.preview ? (
				<button
					type="button"
					className="w-full h-full p-0 border-0 bg-transparent cursor-pointer block"
					onClick={() => onPreviewImage(index)}
					onMouseDown={(e) => {
						// Prevent image mousedown from interfering with drag
						if (!e.currentTarget.contains(e.target as Node)) return;
					}}
				>
					<div className="aspect-square">
						<img
							src={image.preview}
							alt={image.file.name}
							className="w-full h-full object-cover"
						/>
					</div>
				</button>
			) : (
				<button
					type="button"
					className="aspect-square flex items-center justify-center cursor-pointer w-full bg-transparent border-0 p-0"
					onClick={() => onPreviewImage(index)}
					aria-label={`Preview ${image.file.name}`}
					onMouseDown={(e) => {
						// Prevent button mousedown from interfering with drag
						if (!e.currentTarget.contains(e.target as Node)) return;
					}}
				>
					<div className="text-center p-2">
						<AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
						<p className="text-xs text-destructive font-medium">
							{image.file.name}
						</p>
						<p className="text-xs text-destructive/75">{image.error}</p>
					</div>
				</button>
			)}
		</div>
	);
}
