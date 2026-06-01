import { useRef, useCallback } from "react";

interface SwipeHandlers {
	onTouchStart: (e: React.TouchEvent) => void;
	onTouchEnd: (e: React.TouchEvent) => void;
}

export function useTouchSwipe(
	onSwipeLeft: () => void,
	onSwipeRight: () => void,
	minDistance = 50,
): SwipeHandlers {
	const startX = useRef<number | null>(null);

	const onTouchStart = useCallback((e: React.TouchEvent) => {
		startX.current = e.touches[0].clientX;
	}, []);

	const onTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			if (startX.current === null) return;
			const diff = startX.current - e.changedTouches[0].clientX;
			if (Math.abs(diff) >= minDistance) {
				if (diff > 0) onSwipeLeft();
				else onSwipeRight();
			}
			startX.current = null;
		},
		[onSwipeLeft, onSwipeRight, minDistance],
	);

	return { onTouchStart, onTouchEnd };
}
