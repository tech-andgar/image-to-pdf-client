import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { partytownVite } from "@qwik.dev/partytown/utils";

// https://vite.dev/config/
export default defineConfig({
	base: process.env.GITHUB_PAGES ? "/image-to-pdf-client-public/" : "/",
	plugins: [
		react(),
		partytownVite({
			forward: ["dataLayer.push", "gtag"],
		}),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: {
				enabled: false,
			},
			includeAssets: ["icon.svg"],
			manifest: {
				name: "Conversor de Imágenes a PDF",
				short_name: "ImgToPDF",
				description:
					"Convierte tus imágenes a documentos PDF fácilmente. Procesa todo en tu navegador sin enviar archivos a servidores externos.",
				start_url: process.env.GITHUB_PAGES
					? "/image-to-pdf-client-public/"
					: "/",
				display: "standalone",
				background_color: "#ffffff",
				theme_color: "#4F46E5",
				lang: "es",
				scope: process.env.GITHUB_PAGES ? "/image-to-pdf-client-public/" : "/",
				icons: [
					{
						src: "/icon-48.svg",
						sizes: "48x48",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
					{
						src: "/icon-72.svg",
						sizes: "72x72",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
					{
						src: "/icon-96.svg",
						sizes: "96x96",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
					{
						src: "/icon.svg",
						sizes: "512x512",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
				],
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
