import { useCallback } from "react";
import type { ImageFile } from "../../types/image";
import { isPdf } from "../../services/file/fileService";
import { buildImageFiles } from "../../lib/image/file-processing";
import { logger } from "../../services/logger";
import { pdfToImageFiles } from "../../services/pdfImportService";

export function useFileProcessor(allowDuplicates: boolean) {
	const processFiles = useCallback(
		async (
			fileList: FileList,
			currentImages: ImageFile[],
		): Promise<{ pdfImages: ImageFile[]; regularImages: ImageFile[] }> => {
			const filesArray = Array.from(fileList);
			logger.info("File upload started", { fileCount: filesArray.length });

			const pdfFiles = filesArray.filter(isPdf);
			const imageFiles = filesArray.filter((f) => !isPdf(f));

			let pdfImages: ImageFile[] = [];
			if (pdfFiles.length > 0) {
				pdfImages = (
					await Promise.all(pdfFiles.map((pdf) => pdfToImageFiles(pdf)))
				).flat();
			}

			let regularImages: ImageFile[] = [];
			if (imageFiles.length > 0) {
				const dt = new DataTransfer();
				for (const f of imageFiles) dt.items.add(f);
				regularImages = await buildImageFiles(
					dt.files,
					currentImages,
					allowDuplicates,
				);
				const successCount = regularImages.filter((img) => !img.error).length;
				logger.info("File upload completed", {
					fileCount: successCount,
					totalSize: regularImages.reduce((t, img) => t + img.file.size, 0),
				});
			}

			return { pdfImages, regularImages };
		},
		[allowDuplicates],
	);

	return { processFiles };
}
