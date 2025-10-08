import { DndContext } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDragDrop } from "../hooks/useDragDrop";
import { SortableImageItem } from "./SortableImageItem";
import type { ImageFile } from "../types/image";

interface ImagePreviewGridProps {
	uploadedImages: ImageFile[];
	onRemoveImage: (imageId: string) => void;
	onReorderImages: (oldIndex: number, newIndex: number) => void;
	onPreviewImage: (imageIndex: number) => void;
}

/**
 * Image grid component with drag & drop reordering
 * Orchestrates drag & drop interactions using the useDragDrop hook
 */
export function ImagePreviewGrid({
	uploadedImages,
	onRemoveImage,
	onReorderImages,
	onPreviewImage,
}: ImagePreviewGridProps) {
	// Simple drag & drop setup
	const dndContextProps = useDragDrop({
		items: uploadedImages,
		onReorder: onReorderImages,
	});

	if (uploadedImages.length === 0) {
		return null;
	}

	return (
		<DndContext {...dndContextProps}>
			<SortableContext
				items={uploadedImages.map(img => img.id)}
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
							isDragging={false} // Will be handled by useSortable internally
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
