import type { ImageFile } from "../../types/image";
import { createFileSignature } from "../../types/image";
import {
	processFilesWithDuplicateCheck,
	getFileSignaturesFromImages,
	revokeImagePreview,
	createImagePreview,
} from "../../services/fileService";
import { logger } from "../../services/logger";
import { storageService } from "../../services/storageService";

export function generateImageId(): string {
	return `image-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function buildImageFiles(
	fileList: FileList,
	existingImages: ImageFile[],
	allowDuplicates: boolean,
): Promise<ImageFile[]> {
	const existingSignatures = getFileSignaturesFromImages(existingImages);
	const results = await processFilesWithDuplicateCheck(
		fileList,
		existingSignatures,
		allowDuplicates,
	);

	return results.map((result) => {
		const id = generateImageId();
		if ("preview" in result && result.preview) {
			storageService
				.saveImage(result.file, id)
				.catch((err) =>
					logger.error("Failed to save image to IndexedDB", { id, error: err }),
				);
			return { id, file: result.file, preview: result.preview, storageId: id };
		}
		logger.warn("File processing error", {
			fileName: result.file.name,
			error: "error" in result ? result.error : "Unknown error",
		});
		return {
			id,
			file: result.file,
			preview: "",
			error: "error" in result ? result.error : undefined,
		};
	});
}

export function reevaluateDuplicates(
	images: ImageFile[],
	allowDuplicates: boolean,
): ImageFile[] {
	const seen = new Map<string, number>();
	return images.map((image) => {
		const sig = createFileSignature(image.file);
		const key = sig.name + sig.size + sig.lastModified;
		const isDuplicate = seen.has(key);

		if (isDuplicate && !allowDuplicates) {
			if (image.preview) revokeImagePreview(image.preview);
			return {
				...image,
				preview: "",
				error:
					"Esta imagen ya se ha cargado anteriormente. Marca la opción 'Permitir imágenes duplicadas' para cargar múltiples copias.",
			} satisfies ImageFile;
		}

		if (
			(!isDuplicate || allowDuplicates) &&
			!image.preview &&
			image.error?.includes("ya se ha cargado")
		) {
			return {
				...image,
				preview: createImagePreview(image.file),
				error: undefined,
			} satisfies ImageFile;
		}

		if (!isDuplicate) seen.set(key, 1);
		return image;
	});
}
