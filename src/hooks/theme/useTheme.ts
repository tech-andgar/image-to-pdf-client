import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function useTheme() {
	const [isDark, setIsDark] = useState(
		() => globalThis.matchMedia(DARK_QUERY).matches,
	);

	useEffect(() => {
		const mq = globalThis.matchMedia(DARK_QUERY);
		const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return { theme: (isDark ? "dark" : "light") as Theme, isDark } as const;
}
