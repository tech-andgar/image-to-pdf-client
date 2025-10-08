import { AlertCircle, Grip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DndContext,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	rectIntersection,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	rectSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ImageFile } from "../types/image";

interface SortableImageItemProps {
	image: ImageFile;
	index: number;
	onRemoveImage: (imageId: string) => void;
	onPreviewImage: (imageIndex: number) => void;
}

function SortableImageItem({
	image,
	index,
	onRemoveImage,
	onPreviewImage,
}: Readonly<SortableImageItemProps>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
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
			{/* Drag handle - always visible on mobile, more visible on desktop */}
			<div
				className={`absolute top-2 left-2 z-10 bg-black/70 hover:bg-black/90 rounded-md p-1 md:p-1.5 transition-all duration-200 touch-manipulation ${
					isDragging ? "bg-black/90 scale-110" : ""
				}`}
				title="Arrastrar para reordenar"
				{...listeners}
			>
				<Grip className="h-4 w-4 md:h-3 md:w-3 text-white" />
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
					<Trash2 className="h-4 w-4 md:h-3 md:w-3" />
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

interface ImagePreviewGridProps {
	uploadedImages: ImageFile[];
	onRemoveImage: (imageId: string) => void;
	onReorderImages: (oldIndex: number, newIndex: number) => void;
	onPreviewImage: (imageIndex: number) => void;
}

export function ImagePreviewGrid({
	uploadedImages,
	onRemoveImage,
	onReorderImages,
	onPreviewImage,
}: Readonly<ImagePreviewGridProps>) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5, // Slightly reduced for better responsiveness
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 150, // Reduced from 300ms for better responsiveness
				tolerance: 8,
			},
		}),
	);

	if (uploadedImages.length === 0) {
		return null;
	}

	const handleDragStart = (event: DragEndEvent) => {
		console.log("Drag started:", event.active.id);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) {
			console.log("Drag ended without drop target");
			return;
		}

		const activeId = active.id as string;
		const overId = over.id as string;

		if (activeId !== overId) {
			const oldIndex = uploadedImages.findIndex(
				(image) => image.id === activeId,
			);
			const newIndex = uploadedImages.findIndex((image) => image.id === overId);

			if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
				console.log(`Reordering image from ${oldIndex} to ${newIndex}`);
				// Note: onReorderImages should handle the arrayMove logic internally
				onReorderImages(oldIndex, newIndex);
			}
		}
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={rectIntersection} // Better for grid layouts
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={uploadedImages.map((img) => img.id)}
				strategy={rectSortingStrategy}
			>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative">
					{uploadedImages.map((image, index) => (
						<SortableImageItem
							key={image.id}
							image={image}
							index={index}
							onRemoveImage={onRemoveImage}
							onPreviewImage={onPreviewImage}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
