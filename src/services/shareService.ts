/**
 * Sharing service interfaces and implementations following SOLID principles
 */

import { logger } from "./logger";

/** Resultado de operaciones de compartir */
export interface ShareResult {
	success: boolean;
	method: ShareMethod;
	error?: string;
}

/** Método de compartir usado */
export type ShareMethod = "file" | "url" | "clipboard" | "none";

/** Datos para compartir archivos */
export interface ShareFileData {
	files: File[];
	title?: string;
	text?: string;
	url?: string;
}

/** Datos para compartir URL */
export interface ShareUrlData {
	title?: string;
	text?: string;
	url: string;
}

/** Interfaz segregada para compartir archivos */
export interface IFileShareService {
	shareFile(data: ShareFileData): Promise<ShareResult>;
	canShareFile?: (data: ShareFileData) => boolean;
}

/** Interfaz segregada para compartir URLs */
export interface IUrlShareService {
	shareUrl(data: ShareUrlData): Promise<ShareResult>;
	canShareUrl?: (data: ShareUrlData) => boolean;
}

/** Servicio de compartir compuesto que puede manejar ambos tipos */
export interface IUniversalShareService
	extends IFileShareService,
		IUrlShareService {
	// Combined interface
}

/**
 * Fallback share service that only supports clipboard
 */
export class ClipboardShareService implements IUrlShareService {
	async shareUrl(data: ShareUrlData): Promise<ShareResult> {
		try {
			await navigator.clipboard.writeText(data.url);
			return {
				success: true,
				method: "clipboard",
				error: "Se copió la URL al portapapeles. Comparta manualmente.",
			};
		} catch (error) {
			logger.error("Error copying URL to clipboard", error);
			return {
				success: false,
				method: "clipboard",
				error: "No se pudo copiar la URL al portapapeles.",
			};
		}
	}

	canShareUrl?(data: ShareUrlData): boolean {
		return !!navigator.clipboard;
	}
}

/**
 * Web Share API Level 2 service for modern browsers
 */
export class WebShareAPIService implements IUniversalShareService {
	constructor(
		private clipboardFallback: IUrlShareService = new ClipboardShareService(),
	) {}

	async shareFile(data: ShareFileData): Promise<ShareResult> {
		if (!navigator.share) {
			return {
				success: false,
				method: "none",
				error: "Web Share API no está disponible.",
			};
		}

		try {
			await navigator.share(data);
			return { success: true, method: "file" };
		} catch (error) {
			logger.error("Error sharing files with Web Share API", error);
			return {
				success: false,
				method: "none",
				error:
					error instanceof Error
						? error.message
						: "Error al compartir archivo.",
			};
		}
	}

	async shareUrl(data: ShareUrlData): Promise<ShareResult> {
		if (!navigator.share) {
			// Fallback to clipboard
			return this.clipboardFallback.shareUrl(data);
		}

		try {
			await navigator.share(data);
			return { success: true, method: "url" };
		} catch (error) {
			logger.error("Error sharing URL with Web Share API", error);
			// Fallback to clipboard
			return this.clipboardFallback.shareUrl(data);
		}
	}

	canShareFile?(data: ShareFileData): boolean {
		return (
			!!navigator.share &&
			"canShare" in navigator.share &&
			(navigator.share as any).canShare(data)
		);
	}

	canShareUrl?(data: ShareUrlData): boolean {
		return (
			!!navigator.share &&
			"canShare" in navigator.share &&
			(navigator.share as any).canShare(data)
		);
	}
}

/**
 * Factory function to create the best available share service
 */
export function createBestShareService(): IUniversalShareService {
	return new WebShareAPIService();
}
