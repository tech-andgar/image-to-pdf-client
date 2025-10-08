import {
	ALLOWED_IMAGE_TYPES,
	MAX_FILE_SIZE,
	FileValidationResult,
	AllowedImageTypes,
} from "../types/image";

/**
 * Validates a single file
 */
export function validateFile(file: File): FileValidationResult {
	// Check file type
	if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageTypes)) {
		return {
			isValid: false,
			errorMessage:
				"Tipo de archivo no válido. Solo se aceptan JPEG, PNG, BMP y GIF.",
		};
	}

	// Check file size
	if (file.size > MAX_FILE_SIZE) {
		return {
			isValid: false,
			errorMessage: "El archivo es demasiado grande. El límite es 10MB.",
		};
	}

	return {
		isValid: true,
	};
}

/**
 * Creates a blob URL for image preview
 */
export function createImagePreview(file: File): string {
	return URL.createObjectURL(file);
}

/**
 * Revokes a blob URL to free memory
 */
export function revokeImagePreview(url: string): void {
	URL.revokeObjectURL(url);
}

/**
 * Processes a FileList and returns validated files
 */
export function processFiles(
	fileList: FileList,
): Array<
	{ file: File; preview: string } | { file: File; preview: ""; error: string }
> {
	const results: Array<
		{ file: File; preview: string } | { file: File; preview: ""; error: string }
	> = [];

	Array.from(fileList).forEach((file) => {
		const validation = validateFile(file);

		if (validation.isValid) {
			const preview = createImagePreview(file);
			results.push({ file, preview });
		} else {
			results.push({ file, preview: "", error: validation.errorMessage! });
		}
	});

	return results;
}
