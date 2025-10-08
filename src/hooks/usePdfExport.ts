import { useState, useCallback } from "react";
import type { ImageFile } from "../types/image";
import { generatePDF, downloadPDF } from "../services/pdfService";

/**
 * Generates an automatic filename with timestamp
 */
function generateAutoFilename(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hour = String(now.getHours()).padStart(2, '0');
	const minute = String(now.getMinutes()).padStart(2, '0');

	return `imagenes-a-pdf-${year}-${month}-${day}-${hour}-${minute}.pdf`;
}

/**
 * Hook for managing PDF export functionality
 */
export function usePdfExport() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);
	const [filenameInput, setFilenameInput] = useState("");

	/**
	 * Generates and downloads a PDF from the provided ImageFiles array
	 */
	const exportToPDF = useCallback(async (images: ImageFile[]) => {
		if (images.length === 0) {
			setExportError("No hay imágenes para exportar");
			return;
		}

		setIsGenerating(true);
		setExportError(null);

		try {
			const pdfBytes = await generatePDF(images);
			// Use custom filename or generate automatic one
			const finalFilename = filenameInput.trim() || generateAutoFilename();
			downloadPDF(pdfBytes, finalFilename);

			// Reset error state on success
			setExportError(null);
		} catch (error) {
			console.error("Error exporting PDF:", error);
			setExportError(
				error instanceof Error ? error.message : "Error al exportar PDF",
			);
		} finally {
			setIsGenerating(false);
		}
	}, [filenameInput]);

	/**
	 * Clears the current export error
	 */
	const clearExportError = useCallback(() => {
		setExportError(null);
	}, []);

	return {
		isGenerating,
		exportError,
		exportToPDF,
		clearExportError,
		hasError: exportError !== null,
		filename: filenameInput,
		setFilename: setFilenameInput,
		previewFilename: filenameInput.trim() || generateAutoFilename(),
	};
}
