import { useState, useCallback } from "react";
import type { ImageFile } from "../types/image";
import { generatePDF, downloadPDF, sharePDF } from "../services/pdfService";

/**
 * Generates an automatic filename with timestamp
 */
function generateAutoFilename(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hour = String(now.getHours()).padStart(2, "0");
	const minute = String(now.getMinutes()).padStart(2, "0");

	return `imagenes-a-pdf-${year}-${month}-${day}-${hour}-${minute}.pdf`;
}

// Share result type
export interface ShareResult {
	success: boolean;
	method: string;
	error?: string;
}

/**
 * Hook for managing PDF export functionality
 */
export function usePdfExport() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);
	const [shareResult, setShareResult] = useState<ShareResult | null>(null);
	const [filenameInput, setFilenameInput] = useState("");

	/**
	 * Generates and downloads a PDF from the provided ImageFiles array
	 */
	const exportToPDF = useCallback(
		async (images: ImageFile[]) => {
			if (images.length === 0) {
				setExportError("No hay imágenes para exportar");
				return;
			}

			setIsGenerating(true);
			setIsLoadingLibrary(true);
			setExportError(null);

			try {
				const pdfBytes = await generatePDF(images);
				setIsLoadingLibrary(false);

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
				setIsLoadingLibrary(false);
			}
		},
		[filenameInput],
	);

	/**
	 * Shares a PDF using Web Share API or fallback options
	 */
	const shareToPDF = useCallback(
		async (images: ImageFile[]) => {
			if (images.length === 0) {
				setShareResult({
					success: false,
					method: "none",
					error: "No hay imágenes para compartir",
				});
				return;
			}

			setIsSharing(true);
			setIsLoadingLibrary(true);
			setShareResult(null);

			try {
				const pdfBytes = await generatePDF(images);
				setIsLoadingLibrary(false);

				const finalFilename = filenameInput.trim() || generateAutoFilename();

				const result = await sharePDF(pdfBytes, finalFilename);
				setShareResult(result);

				// Clear error state if share was successful or had a fallback
				if (result.success) {
					setExportError(null);
				}
			} catch (error) {
				console.error("Error sharing PDF:", error);
				setShareResult({
					success: false,
					method: "none",
					error:
						error instanceof Error ? error.message : "Error al compartir PDF",
				});
			} finally {
				setIsSharing(false);
				setIsLoadingLibrary(false);
			}
		},
		[filenameInput],
	);

	/**
	 * Clears the current export error
	 */
	const clearExportError = useCallback(() => {
		setExportError(null);
	}, []);

	/**
	 * Clears the current share result
	 */
	const clearShareResult = useCallback(() => {
		setShareResult(null);
	}, []);

	return {
		isGenerating,
		isSharing,
		isLoadingLibrary,
		exportError,
		exportToPDF,
		clearExportError,
		hasError: exportError !== null,
		shareResult,
		shareToPDF,
		clearShareResult,
		filename: filenameInput,
		setFilename: setFilenameInput,
		previewFilename: filenameInput.trim() || generateAutoFilename(),
	};
}
