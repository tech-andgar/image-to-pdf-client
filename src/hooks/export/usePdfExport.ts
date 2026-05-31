import { useState, useCallback } from "react";
import type { ImageFile, CompressionPreset } from "../../types/image";
import { generatePDF, downloadPDF, sharePDF } from "../../services/pdf/index";
import { logger } from "../../services/logger";
import { useFilename } from "./useFilename";

export interface ShareResult {
	success: boolean;
	method: string;
	error?: string;
}

export function usePdfExport() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);
	const [shareResult, setShareResult] = useState<ShareResult | null>(null);
	const [lastPdfSize, setLastPdfSize] = useState<number | null>(null);
	const { filename, previewFilename, setFilename } = useFilename();

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
				setLastPdfSize(pdfBytes.length);
				downloadPDF(pdfBytes, previewFilename);
			} catch (error) {
				logger.error("Error exporting PDF", error);
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
				if (result.success) setExportError(null);
			} catch (error) {
				logger.error("Error sharing PDF", error);
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

	const clearExportError = useCallback(() => setExportError(null), []);
	const clearShareResult = useCallback(() => setShareResult(null), []);

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
		filename,
		setFilename,
		previewFilename,
		lastPdfSize,
	};
}
