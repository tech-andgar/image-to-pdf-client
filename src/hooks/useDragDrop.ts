import { useCallback } from "react";
import {
	PointerSensor,
	useSensor,
	useSensors,
	rectIntersection,
	type DragEndEvent,
} from "@dnd-kit/core";

export interface UseDragDropOptions {
	/** Items con sus IDs únicas */
	items: { id: string }[];
	/** Callback cuando cambia el orden */
	onReorder: (oldIndex: number, newIndex: number) => void;
}

/**
 * Custom hook for drag & drop functionality with @dnd-kit
 * Simplified version with better mobile support
 */
export function useDragDrop({ items, onReorder }: UseDragDropOptions) {
	// Simple sensor setup - PointerSensor handles both mouse and touch
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Standard activation distance
			},
		}),
	);

	// Handle drag end and reordering
	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;

			if (!over || active.id === over.id) {
				return;
			}

			const oldIndex = items.findIndex((item) => item.id === active.id);
			const newIndex = items.findIndex((item) => item.id === over.id);

			if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
				console.log(`Reordering from ${oldIndex} to ${newIndex}`);
				onReorder(oldIndex, newIndex);
			}
		},
		[items, onReorder],
	);

	// Return just the essential values for DndContext
	return {
		sensors,
		collisionDetection: rectIntersection,
		onDragEnd: handleDragEnd,
	};
}

// Type for the return value
export type UseDragDropReturn = ReturnType<typeof useDragDrop>;
