import {
	ALLOWED_IMAGE_TYPES,
	ALLOWED_EXTENSIONS,
	ALLOWED_PDF_TYPE,
	MAX_FILE_SIZE,
	type FileValidationResult,
	type FileSignature,
	type AllowedImageTypes,
	createFileSignature,
	areFilesIdentical,
} from "../types/image";
import { hasValidSignature, hasPdfMagicBytes } from "../core/validation";

export function isPdf(file: File): boolean {
	return file.type === ALLOWED_PDF_TYPE;
}

/**
 * Validates a single file, including magic-byte check for PDFs.
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
	// Check file type
	if (
		!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageTypes) &&
		file.type !== ALLOWED_PDF_TYPE
	) {
		return {
			isValid: false,
			errorMessage: `Tipo de archivo no válido. Solo se aceptan ${ALLOWED_EXTENSIONS.join(", ")}.`,
		};
	}

	// Check file size
	if (file.size > MAX_FILE_SIZE) {
		return {
			isValid: false,
			errorMessage: `El archivo es demasiado grande. El límite es ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
		};
	}

	// Verify PDF magic bytes to catch misnamed files
	if (file.type === ALLOWED_PDF_TYPE && !(await hasPdfMagicBytes(file))) {
		return {
			isValid: false,
			errorMessage: "El archivo no es un PDF válido.",
		};
	}

	// Verify image magic bytes to catch spoofed MIME types
	if (
		ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageTypes) &&
		!(await hasValidSignature(file))
	) {
		return {
			isValid: false,
			errorMessage:
				"El archivo no coincide con su tipo declarado. Posible archivo corrupto.",
		};
	}

	return { isValid: true };
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
 * Processes a FileList and returns validated files, with optional duplicate checking
 */
export async function processFilesWithDuplicateCheck(
	fileList: FileList,
	existingFiles: FileSignature[] = [],
	allowDuplicates: boolean = false,
): Promise<
	Array<
		{ file: File; preview: string } | { file: File; preview: ""; error: string }
	>
> {
	const results: Array<
		{ file: File; preview: string } | { file: File; preview: ""; error: string }
	> = [];

	for (const file of Array.from(fileList)) {
		const validation = await validateFile(file);
		if (!validation.isValid) {
			results.push({
				file,
				preview: "",
				error: validation.errorMessage ?? "Archivo inválido",
			});
			continue;
		}

		if (!allowDuplicates) {
			const fileSignature = createFileSignature(file);
			const isDuplicate = existingFiles.some((existing) =>
				areFilesIdentical(fileSignature, existing),
			);

			if (isDuplicate) {
				results.push({
					file,
					preview: "",
					error:
						"Esta imagen ya se ha cargado anteriormente. Marca la opción 'Permitir imágenes duplicadas' para cargar múltiples copias.",
				});
				continue;
			}
		}

		const preview = createImagePreview(file);
		results.push({ file, preview });
	}

	return results;
}

/**
 * Extracts file signatures from existing ImageFile array
 */
export function getFileSignaturesFromImages(
	images: Array<{ file: File }>,
): FileSignature[] {
	return images.map((img) => createFileSignature(img.file));
}
