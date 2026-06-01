import {
	sanitizeFilename,
	generateFallbackFilename,
} from "../file/fileSanitizer";
import type { IUniversalShareService, ShareResult } from "../shareService";
import { createBestShareService } from "../shareService";
import { logger } from "../logger";

export class PdfSharer {
	private readonly shareService: IUniversalShareService;

	constructor() {
		this.shareService = createBestShareService();
	}

	async share(pdfBytes: Uint8Array, filename: string): Promise<ShareResult> {
		try {
			if (!pdfBytes || pdfBytes.length === 0)
				throw new Error("No hay datos de PDF para compartir");

			const finalFilename =
				sanitizeFilename(filename) || generateFallbackFilename();
			const fileToShare = new File([new Uint8Array(pdfBytes)], finalFilename, {
				type: "application/pdf",
			});

			const fileValid = await this.validateFileReadable(
				fileToShare,
				pdfBytes.length,
			);
			if (!fileValid) {
				throw new Error(
					"El PDF se generó correctamente pero se invalidó antes de compartir. " +
						"Esto ocurre cuando la aplicación deja de ser la principal (al ir a otra app). " +
						"Reinicie la aplicación, cárgue las imágenes nuevamente y genere un nuevo PDF.",
				);
			}

			return await this.shareService.shareFile({
				files: [fileToShare],
				title: filename,
				text: "PDF generado con imágenes convertidas",
				// Omit url — apps like WhatsApp reject file shares that include a url
			});
		} catch (error) {
			logger.error("Error sharing PDF", error);
			return {
				success: false,
				method: "none",
				error:
					error instanceof Error
						? error.message
						: "Error desconocido al compartir",
			};
		}
	}

	private validateFileReadable(
		file: File,
		totalBytes: number,
	): Promise<boolean> {
		return new Promise((resolve) => {
			const reader = new FileReader();
			let done = false;
			let timeoutId: number | undefined;

			const finish = (result: boolean) => {
				if (done) return;
				done = true;
				clearTimeout(timeoutId);
				resolve(result);
			};

			reader.onload = (e) =>
				finish(
					e.target?.result instanceof ArrayBuffer &&
						e.target.result.byteLength > 0,
				);
			reader.onerror = () => {
				logger.warn("PDF File validation read failed before sharing");
				finish(false);
			};

			timeoutId = globalThis.setTimeout(() => {
				logger.warn("PDF File validation read timeout before sharing");
				reader.abort();
				finish(false);
			}, 3000);

			try {
				reader.readAsArrayBuffer(file.slice(0, Math.min(1024, totalBytes)));
			} catch {
				finish(false);
			}
		});
	}
}
