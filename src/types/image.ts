// Image and file related type definitions
export interface ImageFile {
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
