import { useEffect, useState } from "react";
import { APP_NAME } from "../../config/app";
import { STORAGE_KEYS } from "../../config/limits";

export function usePwaRename() {
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		// Only relevant when running as installed PWA
		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			("standalone" in window.navigator &&
				(window.navigator as { standalone?: boolean }).standalone === true);

		if (!isStandalone) return;

		const recorded = localStorage.getItem(STORAGE_KEYS.APP_NAME);

		if (!recorded) {
			// First visit — record current name, no banner
			localStorage.setItem(STORAGE_KEYS.APP_NAME, APP_NAME);
			return;
		}

		if (recorded !== APP_NAME) {
			setShowBanner(true);
		}
	}, []);

	const dismiss = () => {
		localStorage.setItem(STORAGE_KEYS.APP_NAME, APP_NAME);
		setShowBanner(false);
	};

	return { showBanner, dismiss };
}
