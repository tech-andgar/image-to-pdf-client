export interface MagicSignature {
	mime: string;
	bytes: number[];
}

export const IMAGE_SIGNATURES: MagicSignature[] = [
	{ mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
	{ mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
	{ mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
	{ mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
	{ mime: "image/bmp", bytes: [0x42, 0x4d] },
];

export const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF

export async function hasValidSignature(
	file: File,
	signatures: MagicSignature[] = IMAGE_SIGNATURES,
): Promise<boolean> {
	const maxLen = Math.max(...signatures.map((s) => s.bytes.length));
	const slice = file.slice(0, maxLen);
	const buf = await slice.arrayBuffer();
	const bytes = new Uint8Array(buf);
	const sig = signatures.find((s) => s.mime === file.type);
	if (!sig) return false;
	return sig.bytes.every((b, i) => bytes[i] === b);
}

export async function hasPdfMagicBytes(file: File): Promise<boolean> {
	const slice = file.slice(0, 4);
	const buf = await slice.arrayBuffer();
	const bytes = new Uint8Array(buf);
	return PDF_MAGIC.every((b, i) => bytes[i] === b);
}
