import { useState, useCallback } from "react";
import {
	sanitizeFilename,
	generateFallbackFilename,
} from "../../services/file/fileSanitizer";

export function useFilename() {
	const [filenameInput, setFilenameInput] = useState("");

	const previewFilename = filenameInput.trim()
		? sanitizeFilename(filenameInput)
		: generateFallbackFilename();

	const setFilename = useCallback(
		(filename: string) => setFilenameInput(filename),
		[],
	);

	return { filename: filenameInput, previewFilename, setFilename };
}
