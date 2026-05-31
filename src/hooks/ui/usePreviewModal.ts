import { useCallback, useState } from "react";
import { userMetrics } from "../../services/userMetrics";

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
		userMetrics.trackImagePreviewed();
	}, []);

	const closePreviewModal = useCallback(() => {
		setPreviewModal({ isOpen: false, currentIndex: null });
	}, []);

	const setPreviewImage = useCallback((imageIndex: number) => {
		setPreviewModal((prev) => ({ ...prev, currentIndex: imageIndex }));
	}, []);

	return { previewModal, openPreviewModal, closePreviewModal, setPreviewImage };
}
