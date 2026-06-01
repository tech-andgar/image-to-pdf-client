import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import {
	APP_NAME,
	APP_SHORT_NAME,
	APP_DESCRIPTION,
} from "./src/config/app.config.js";

function htmlAppMetaPlugin() {
	return {
		name: "html-app-meta",
		transformIndexHtml(html) {
			return html
				.replace(/__APP_NAME__/g, APP_NAME)
				.replace(/__APP_DESCRIPTION__/g, APP_DESCRIPTION);
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	base: process.env.GITHUB_PAGES ? "/image-to-pdf-client-public/" : "/",
	plugins: [
		htmlAppMetaPlugin(),
		react(),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: {
				enabled: false,
			},
			includeAssets: ["icon.svg"],
			manifest: {
				name: APP_NAME,
				short_name: APP_SHORT_NAME,
				description: APP_DESCRIPTION,
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
				globIgnores: ["wasm/**", "iccs/**", "cmaps/**", "standard_fonts/**"],
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MiB
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
			treeshake: {
				moduleSideEffects: false,
				propertyReadSideEffects: false,
				tryCatchDeoptimization: false,
			},
			output: {
				manualChunks: (id) => {
					// Separate pdf-lib and compression libraries
					if (id.includes("pdf-lib")) {
						return "pdf";
					}
					if (id.includes("pdfjs-dist")) {
						return undefined; // let rolldown split naturally — don't force into vendor-libs
					}
					if (id.includes("web-streams-polyfill")) {
						return "streams-polyfill";
					}
					// Dnd-kit libraries
					if (id.includes("@dnd-kit")) {
						return "dnd";
					}
					// React core
					if (id.includes("react")) {
						return "react";
					}
					// Radix UI components (used by shadcn/ui)
					if (id.includes("@radix-ui")) {
						return "radix";
					}
					// Lucide icons
					if (id.includes("lucide-react")) {
						return "icons";
					}
					// Tailwind utilities
					if (
						id.includes("tailwind-merge") ||
						id.includes("class-variance-authority")
					) {
						return "tailwind-utils";
					}
					// Other node modules
					if (id.includes("node_modules")) {
						return "vendor-libs";
					}
				},
			},
		},
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: ["console.log", "console.info", "console.debug"],
			},
			mangle: {
				safari10: true,
			},
		},
		chunkSizeWarningLimit: 1000,
		sourcemap: false, // Disable sourcemaps for better minification
	},
});
