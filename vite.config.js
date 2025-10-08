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
						src: process.env.GITHUB_PAGES
							? "/image-to-pdf-client-public/icon-48.svg"
							: "/icon-48.svg",
						sizes: "48x48",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
					{
						src: process.env.GITHUB_PAGES
							? "/image-to-pdf-client-public/icon-72.svg"
							: "/icon-72.svg",
						sizes: "72x72",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
					{
						src: process.env.GITHUB_PAGES
							? "/image-to-pdf-client-public/icon-96.svg"
							: "/icon-96.svg",
						sizes: "96x96",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
					{
						src: process.env.GITHUB_PAGES
							? "/image-to-pdf-client-public/icon.svg"
							: "/icon.svg",
						sizes: "512x512",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
				// Optimize cache strategies for better performance
				runtimeCaching: [
					{
						urlPattern: /\.js$/,
						handler: "CacheFirst",
						options: {
							cacheName: "js-assets-cache",
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
						},
					},
					{
						urlPattern: /\.css$/,
						handler: "CacheFirst",
						options: {
							cacheName: "css-assets-cache",
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
						},
					},
					{
						urlPattern: /\.(png|jpg|jpeg|svg|gif|ico|webp)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "image-assets-cache",
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year for images
							},
						},
					},
					{
						urlPattern: /\.(woff2?|ttf|eot)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "font-assets-cache",
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year for fonts
							},
						},
					},
				],
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
