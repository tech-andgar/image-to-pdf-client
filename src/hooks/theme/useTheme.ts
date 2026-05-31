import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function applyTheme(dark: boolean) {
	document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
	const [isDark, setIsDark] = useState(() => {
		const dark = window.matchMedia(DARK_QUERY).matches;
		applyTheme(dark);
		return dark;
	});

	useEffect(() => {
		const mq = window.matchMedia(DARK_QUERY);
		const handler = (e: MediaQueryListEvent) => {
			applyTheme(e.matches);
			setIsDark(e.matches);
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return { theme: (isDark ? "dark" : "light") as Theme, isDark } as const;
}
