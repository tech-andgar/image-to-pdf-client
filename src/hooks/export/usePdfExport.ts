import { useState, useCallback } from "react";
import type { ImageFile, CompressionPreset } from "../../types/image";
import { generatePDF, downloadPDF, sharePDF } from "../../services/pdf/index";
import { logger } from "../../services/logger";
import { userMetrics } from "../../services/privacy/userMetrics";
import { analytics } from "../../core/analytics";
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

	const withPdfGeneration = useCallback(
		async <T>(
			images: ImageFile[],
			preset: CompressionPreset | undefined,
			onSuccess: (pdfBytes: Uint8Array) => Promise<T> | T,
			onError: (error: unknown) => void,
			setLoading: (v: boolean) => void,
		) => {
			setLoading(true);
			setIsLoadingLibrary(true);
			analytics.timeStart("pdf_generation");
			try {
				const pdfBytes = await generatePDF(images, preset);
				setIsLoadingLibrary(false);
				setLastPdfSize(pdfBytes.length);
				analytics.timeEnd("pdf_generation");
				return await onSuccess(pdfBytes);
			} catch (error) {
				logger.error("Error generating PDF", error);
				onError(error);
			} finally {
				setLoading(false);
				setIsLoadingLibrary(false);
			}
		},
		[],
	);

	const exportToPDF = useCallback(
		async (images: ImageFile[], preset?: CompressionPreset) => {
			if (images.length === 0) {
				setExportError("No hay imágenes para exportar");
				return;
			}
			setExportError(null);
			await withPdfGeneration(
				images,
				preset,
				(pdfBytes) => {
					downloadPDF(pdfBytes, previewFilename);
					userMetrics.trackPdfExported(images.length, pdfBytes.length);
				},
				(error) => {
					userMetrics.trackError(
						"pdf_export",
						error instanceof Error ? error.message : "unknown",
					);
					setExportError(
						error instanceof Error ? error.message : "Error al exportar PDF",
					);
				},
				setIsGenerating,
			);
		},
		[previewFilename, withPdfGeneration],
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
			setShareResult(null);
			await withPdfGeneration(
				images,
				preset,
				async (pdfBytes) => {
					const result = await sharePDF(pdfBytes, previewFilename);
					setShareResult(result);
					if (result.success) {
						setExportError(null);
						userMetrics.trackPdfShared(images.length);
					}
				},
				(error) => {
					userMetrics.trackError(
						"pdf_share",
						error instanceof Error ? error.message : "unknown",
					);
					setShareResult({
						success: false,
						method: "none",
						error:
							error instanceof Error ? error.message : "Error al compartir PDF",
					});
				},
				setIsSharing,
			);
		},
		[previewFilename, withPdfGeneration],
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
