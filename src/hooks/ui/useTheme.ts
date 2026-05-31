import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Hook para detectar el tema actual usando light-dark() CSS
 * CSS maneja automáticamente el cambio basado en prefers-color-scheme
 * Solo proporciona información del tema para componentes que la necesitan
 */
export function useTheme() {
	const [theme, setTheme] = useState<Theme>("light");

	// Detectar el tema del navegador usando CSScomputedStyle con light-dark()
	const detectCurrentTheme = useCallback((): Theme => {
		const testElement = document.createElement("div");
		testElement.style.color = "light-dark(black, white)";
		document.body.appendChild(testElement);

		const computedStyle = getComputedStyle(testElement);
		const isDark = computedStyle.color === "rgb(255, 255, 255)"; // white = dark theme

		document.body.removeChild(testElement);
		return isDark ? "dark" : "light";
	}, []);

	// Actualizar estado del tema detectado
	const updateTheme = useCallback(() => {
		setTheme(detectCurrentTheme());
	}, [detectCurrentTheme]);

	// Inicializar al montar el componente
	useEffect(() => {
		updateTheme();
	}, [updateTheme]);

	// Escuchar cambios de media query
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			updateTheme();
		};

		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, [updateTheme]);

	return {
		theme,
		isDark: theme === "dark",
		// light-dark() maneja el tema automáticamente, no se necesita setTheme
	} as const;
}
