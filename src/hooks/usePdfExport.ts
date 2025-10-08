import { useState, useCallback } from "react";
import type { ImageFile } from "../types/image";
import { generatePDF, downloadPDF } from "../services/pdfService";

/**
 * Hook for managing PDF export functionality
 */
export function usePdfExport() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);

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
			downloadPDF(pdfBytes, "imagenes-a-pdf.pdf");

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
	}, []);

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
	};
}
