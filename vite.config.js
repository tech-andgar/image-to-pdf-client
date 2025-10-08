import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	base: process.env.GITHUB_PAGES ? "/img-to-pdf-client/" : "/",
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: {
				enabled: false,
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
			},
		}),
	],
	resolve: {
		alias: {
			"@": "/src",
		},
	},
	server: {
		allowedHosts: true,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Separate pdf-lib and compression libraries
					if (id.includes("pdf-lib")) {
						return "pdf";
					}
					// Dnd-kit libraries
					if (id.includes("@dnd-kit")) {
						return "dnd";
					}
					// React vendor
					if (id.includes("react") || id.includes("react-dom")) {
						return "vendor";
					}
					// Node modules chunk
					if (id.includes("node_modules")) {
						return "vendor-libs";
					}
				},
			},
		},
		chunkSizeWarningLimit: 1000, // Increase warning limit to 1000KB
	},
});
