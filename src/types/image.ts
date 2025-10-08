// Image and file related type definitions
export interface ImageFile {
	id: string;
	file: File;
	preview: string;
	error?: string;
}

export interface FileValidationResult {
	isValid: boolean;
	errorMessage?: string;
}

export type AllowedImageTypes =
	| "image/jpeg"
	| "image/png"
	| "image/bmp"
	| "image/gif";

export const ALLOWED_IMAGE_TYPES: AllowedImageTypes[] = [
	"image/jpeg",
	"image/png",
	"image/bmp",
	"image/gif",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EXTENSIONS = ["JPEG", "PNG", "BMP", "GIF"];

export interface CompressionOptions {
	quality: number; // 0-1 for JPEG, ignored for PNG
	maxWidth?: number; // Maximum width in pixels
	maxHeight?: number; // Maximum height in pixels
	maintainAspectRatio: boolean;
}

export interface CompressionResult {
	file: File;
	compressedSize: number;
	compressionRatio: number; // 0-1 (1 = no compression)
	dimensions: { width: number; height: number };
}

export interface CompressionStats {
	originalSize: number;
	compressedSize: number;
	compressionRatio: number;
	time_elapsed: number; // in milliseconds
}

/**
 * Predefined compression presets
 */
export const COMPRESSION_PRESETS = {
	high: {
		quality: 0.9,
		maxWidth: 2048,
		maxHeight: 2048,
		maintainAspectRatio: true,
	},
	medium: {
		quality: 0.75,
		maxWidth: 1536,
		maxHeight: 1536,
		maintainAspectRatio: true,
	},
	low: {
		quality: 0.6,
		maxWidth: 1024,
		maxHeight: 1024,
		maintainAspectRatio: true,
	},
	minimal: {
		quality: 0.4,
		maxWidth: 800,
		maxHeight: 800,
		maintainAspectRatio: true,
	},
} as const;

export type CompressionPreset = keyof typeof COMPRESSION_PRESETS;
