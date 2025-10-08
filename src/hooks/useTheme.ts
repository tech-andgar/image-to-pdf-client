import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Hook para gestionar el tema del navegador
 * Maneja automáticamente la clase 'dark' en document.documentElement
 * basado en la preferencia del navegador
 */
export function useTheme() {
	const [theme, setTheme] = useState<Theme>("light");

	// Detectar el tema preferido del navegador
	const getSystemTheme = useCallback((): Theme => {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			return "dark";
		}
		return "light";
	}, []);

	// Aplicar la clase 'dark' al elemento raíz y actualizar estado
	const applyTheme = useCallback((newTheme: Theme) => {
		const root = document.documentElement;
		if (newTheme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
		setTheme(newTheme);
	}, []);

	// Inicializar tema basado en navegador al montar
	useEffect(() => {
		const systemTheme = getSystemTheme();
		applyTheme(systemTheme);
	}, [getSystemTheme, applyTheme]);

	// Escuchar cambios en la preferencia del navegador
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = (e: MediaQueryListEvent) => {
			const newTheme: Theme = e.matches ? "dark" : "light";
			applyTheme(newTheme);
		};

		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, [applyTheme]);

	return {
		theme,
		setTheme: applyTheme,
		isDark: theme === "dark",
	} as const;
}
