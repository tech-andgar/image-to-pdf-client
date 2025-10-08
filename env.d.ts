/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly NODE_ENV: "development" | "production";
	readonly PORT: string;
	readonly SITE_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
