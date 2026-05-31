import { useState, useCallback } from "react";
import type { ImageFile, CompressionPreset } from "../types/image";
import { generatePDF, downloadPDF, sharePDF } from "../services/pdfService";
import { sanitizeFilename } from "../services/fileSanitizer";

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

	// Compute preview filename (sanitized filename for operations)
	const previewFilename = filenameInput.trim()
		? sanitizeFilename(filenameInput)
		: generateAutoFilename();

	// Handle filename changes (raw user input for UI display)
	const setFilename = useCallback((filename: string) => {
		setFilenameInput(filename);
	}, []);

	/**
	 * Generates and downloads a PDF from the provided ImageFiles array
	 */
	const exportToPDF = useCallback(
		async (images: ImageFile[], preset?: CompressionPreset) => {
			if (images.length === 0) {
				setExportError("No hay imágenes para exportar");
				return;
			}

			setIsGenerating(true);
			setIsLoadingLibrary(true);
			setExportError(null);

			try {
				const pdfBytes = await generatePDF(images, preset);
				setIsLoadingLibrary(false);

				downloadPDF(pdfBytes, previewFilename);

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
		[previewFilename],
	);

	/**
	 * Shares a PDF using Web Share API or fallback options
	 */
	const shareToPDF = useCallback(
		async (images: ImageFile[], preset?: CompressionPreset) => {
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
				const pdfBytes = await generatePDF(images, preset);
				setIsLoadingLibrary(false);

				const result = await sharePDF(pdfBytes, previewFilename);
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
		[previewFilename],
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
		setFilename: setFilename,
		previewFilename,
	};
}
