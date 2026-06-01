import {
	DndContext,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	rectIntersection,
	type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { ImageFile } from "../../types/image";
import { SortableImageItem } from "./SortableImageItem";

interface ImagePreviewGridProps {
	readonly uploadedImages: ImageFile[];
	readonly selectedIds: Set<string>;
	readonly onToggleSelect: (id: string) => void;
	readonly onRemoveImage: (imageId: string) => void;
	readonly onReorderImages: (oldIndex: number, newIndex: number) => void;
	readonly onPreviewImage: (imageIndex: number) => void;
}

export function ImagePreviewGrid({
	uploadedImages,
	selectedIds,
	onToggleSelect,
	onRemoveImage,
	onReorderImages,
	onPreviewImage,
}: ImagePreviewGridProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 150, tolerance: 8 },
		}),
	);

	if (uploadedImages.length === 0) return null;

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;
		const activeId = active.id as string;
		const overId = over.id as string;
		if (activeId !== overId) {
			const oldIndex = uploadedImages.findIndex((img) => img.id === activeId);
			const newIndex = uploadedImages.findIndex((img) => img.id === overId);
			if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
				onReorderImages(oldIndex, newIndex);
			}
		}
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={rectIntersection}
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
							isSelected={selectedIds.has(image.id)}
							onToggleSelect={onToggleSelect}
							onRemoveImage={onRemoveImage}
							onPreviewImage={onPreviewImage}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
