import * as pdfjsLib from "pdfjs-dist";
import type { ImageFile } from "../types/image";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).toString();

export async function pdfToImageFiles(file: File): Promise<ImageFile[]> {
	const arrayBuffer = await file.arrayBuffer();
	// Keep original for pdfSource; pass a copy to pdfjs since it transfers the buffer to the worker
	const pdfBytes = new Uint8Array(arrayBuffer);
	const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
	const results: ImageFile[] = [];

	for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
		const page = await pdf.getPage(pageNum);
		const viewport = page.getViewport({ scale: 2 });

		const canvas = document.createElement("canvas");
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) continue;

		await page.render({ canvasContext: ctx, viewport, canvas }).promise;

		const blob = await new Promise<Blob>((resolve, reject) =>
			canvas.toBlob(
				(b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
				"image/jpeg",
				0.92,
			),
		);

		const baseName = file.name.replace(/\.pdf$/i, "");
		const pageFile = new File(
			[blob],
			`${baseName}_p${String(pageNum).padStart(3, "0")}.jpg`,
			{ type: "image/jpeg" },
		);

		results.push({
			id: `pdf-${file.name}-p${pageNum}-${Date.now()}`,
			file: pageFile,
			preview: URL.createObjectURL(blob),
			pdfSource: { pdfBytes, pageIndex: pageNum - 1 },
		});
	}

	return results;
}
