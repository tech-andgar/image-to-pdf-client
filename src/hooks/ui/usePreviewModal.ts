import { useCallback, useState } from "react";

interface PreviewModalState {
	isOpen: boolean;
	currentIndex: number | null;
}

export function usePreviewModal() {
	const [previewModal, setPreviewModal] = useState<PreviewModalState>({
		isOpen: false,
		currentIndex: null,
	});

	const openPreviewModal = useCallback((imageIndex: number) => {
		setPreviewModal({ isOpen: true, currentIndex: imageIndex });
	}, []);

	const closePreviewModal = useCallback(() => {
		setPreviewModal({ isOpen: false, currentIndex: null });
	}, []);

	const setPreviewImage = useCallback((imageIndex: number) => {
		setPreviewModal((prev) => ({ ...prev, currentIndex: imageIndex }));
	}, []);

	return { previewModal, openPreviewModal, closePreviewModal, setPreviewImage };
}
