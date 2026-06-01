/**
 * Decrypt a password-protected PDF using mupdf WASM.
 * pdf-lib has no decryption API — mupdf is the only viable in-browser option.
 * Loaded lazily (9.5MB WASM) only when a PDF requires a password.
 */
export async function decryptPdf(
	pdfBytes: Uint8Array,
	password: string,
): Promise<Uint8Array> {
	const mupdf = (await import("mupdf")).default;
	const doc = mupdf.Document.openDocument(pdfBytes, "application/pdf");

	if (doc.needsPassword()) {
		const ok = doc.authenticatePassword(password);
		if (!ok) throw new Error("Contraseña incorrecta");
	}

	const pdfDoc = doc.asPDF();
	const buf = pdfDoc.saveToBuffer({ decrypt: true });
	return new Uint8Array(buf.asUint8Array());
}
