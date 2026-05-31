/** Max pixels for canvas operations — exceeding crashes mobile browsers */
export const MAX_CANVAS_PIXELS = 16_777_216; // 4096×4096

/** Max pixels allowed for uploaded images before rejection */
export const MAX_IMAGE_PIXELS = 100_000_000; // 100MP

/** Max file size in bytes */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** Max pages when importing a PDF */
export const MAX_PDF_PAGES = 100;

/** Default JPEG quality for internal conversions (PDF render, format convert) */
export const DEFAULT_JPEG_QUALITY = 0.92;

/** Default scale factor for PDF page rendering */
export const PDF_RENDER_SCALE = 2;

/** Max log entries kept in localStorage */
export const MAX_LOG_ENTRIES = 100;

/** Max user metric entries kept in localStorage */
export const MAX_METRIC_ENTRIES = 200;

/** Clamp dimensions to fit within MAX_CANVAS_PIXELS, preserving aspect ratio */
export function clampDimensions(
	width: number,
	height: number,
	maxPixels = MAX_CANVAS_PIXELS,
): { width: number; height: number; scale: number } {
	const pixels = width * height;
	if (pixels <= maxPixels) return { width, height, scale: 1 };
	const scale = Math.sqrt(maxPixels / pixels);
	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale),
		scale,
	};
}
