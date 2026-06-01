import { useState, useCallback } from "react";
import type { ImageFile } from "../types/image";

export function useImageSelection() {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const toggle = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const selectAll = useCallback((images: ImageFile[]) => {
		setSelectedIds(new Set(images.map((img) => img.id)));
	}, []);

	const selectNone = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	const syncWithImages = useCallback((images: ImageFile[]) => {
		setSelectedIds((prev) => {
			const validIds = new Set(images.map((img) => img.id));
			const filtered = new Set([...prev].filter((id) => validIds.has(id)));
			return filtered.size === prev.size ? prev : filtered;
		});
	}, []);

	const getSelected = useCallback(
		(images: ImageFile[]): ImageFile[] =>
			selectedIds.size === 0
				? images
				: images.filter((img) => selectedIds.has(img.id)),
		[selectedIds],
	);

	return {
		selectedIds,
		toggle,
		selectAll,
		selectNone,
		syncWithImages,
		getSelected,
	};
}
