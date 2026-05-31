import { logger } from "../logger";

export class PdfDownloader {
	download(pdfBytes: Uint8Array, filename: string): void {
		try {
			const blob = new Blob([pdfBytes], { type: "application/pdf" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			setTimeout(() => URL.revokeObjectURL(url), 100);
		} catch (error) {
			logger.error("Error downloading PDF", error);
			throw new Error("Failed to download PDF");
		}
	}
}
