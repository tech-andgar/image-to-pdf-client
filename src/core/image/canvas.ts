export const MAX_CANVAS_PIXELS = 16_777_216; // 4096×4096
export const MAX_IMAGE_PIXELS = 100_000_000; // 100MP

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
