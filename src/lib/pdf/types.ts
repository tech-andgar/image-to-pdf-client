type PdfLib = typeof import("pdf-lib");

export function loadPdfDoc(pdfLib: PdfLib, bytes: Uint8Array) {
	return pdfLib.PDFDocument.load(bytes, { ignoreEncryption: true });
}

export interface PdfXObject {
	name: string;
	width: number;
	height: number;
	filterName: string | null;
	rawBytes: Uint8Array;
	hasMask: boolean;
}

export interface CompressOptions {
	quality: number;
	mimeType: "image/jpeg" | "image/webp";
}

export interface CompressedXObject {
	name: string;
	bytes: Uint8Array;
	width: number;
	height: number;
}

export interface ImageDecoder {
	canDecode(filterName: string | null): boolean;
	decode(xobj: PdfXObject): Promise<ImageBitmap>;
}
