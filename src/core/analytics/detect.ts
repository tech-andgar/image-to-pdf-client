import type { UserProperties } from "./types";

export function detectUserProperties(): UserProperties {
	const width = window.innerWidth;
	const isStandalone =
		window.matchMedia("(display-mode: standalone)").matches ||
		("standalone" in navigator &&
			(navigator as { standalone?: boolean }).standalone === true);

	const sessionCount =
		Number(localStorage.getItem("_session_count") ?? "0") + 1;
	localStorage.setItem("_session_count", String(sessionCount));

	const nav = navigator as {
		connection?: { effectiveType?: string };
		standalone?: boolean;
	};

	return {
		device_type: width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop",
		app_mode: isStandalone ? "pwa" : "browser",
		returning_user: sessionCount > 1,
		screen_size: `${width}x${window.innerHeight}`,
		language: navigator.language,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		connection_type: nav.connection?.effectiveType ?? "unknown",
		browser: detectBrowser(),
		os: detectOS(),
		session_count: sessionCount,
	};
}

function detectBrowser(): string {
	const ua = navigator.userAgent;
	if (ua.includes("Firefox")) return "firefox";
	if (ua.includes("Edg")) return "edge";
	if (ua.includes("Chrome")) return "chrome";
	if (ua.includes("Safari")) return "safari";
	return "other";
}

function detectOS(): string {
	const ua = navigator.userAgent;
	if (ua.includes("Android")) return "android";
	if (ua.includes("iPhone") || ua.includes("iPad")) return "ios";
	if (ua.includes("Mac")) return "macos";
	if (ua.includes("Windows")) return "windows";
	if (ua.includes("Linux")) return "linux";
	return "other";
}
