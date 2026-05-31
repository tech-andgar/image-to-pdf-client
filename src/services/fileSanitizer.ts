import { APP_FILENAME_PREFIX } from "../config/app";

/**
 * Sanitize filename to be compatible with Android Chrome and other mobile browsers.
 * Removes accents, special characters, and replaces spaces with hyphens.
 */
export function sanitizeFilename(
	filename: string,
	extension: string = ".pdf",
): string {
	// Basic sanitization: remove path separators and null bytes
	const cleanFilename = filename
		.replace(/[/\\:*?"<>|]+/g, "") // Remove path separators and reserved chars
		.replace(/\0/g, "") // Remove null bytes
		.trim();

	// Decompose accented characters and remove accent marks (NFD decomposition)
	const normalized = cleanFilename
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");

	// Keep only ASCII safe characters: letters, numbers, spaces, hyphens, underscores, dots
	const asciiSafe = normalized.replace(/[^a-zA-Z0-9\s\-_.]/g, "");

	// Replace spaces with hyphens and clean up multiple separators
	const hyphenated = asciiSafe
		.replace(/\s+/g, "-") // Spaces to hyphens
		.replace(/-+/g, "-") // Multiple hyphens to single
		.replace(/\.+/g, ".") // Multiple dots to single
		.trim()
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

	// Ensure we have a name after sanitization
	if (hyphenated.length === 0) {
		return `${APP_FILENAME_PREFIX}${extension}`;
	}

	// Add extension only if not already present (case insensitive)
	const name = hyphenated.toLowerCase();
	const ext = extension.toLowerCase();

	if (name.endsWith(ext)) {
		return name;
	}

	return name + extension;
}

/**
 * Generate a fallback filename when sanitization results in empty string
 */
export function generateFallbackFilename(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hour = String(now.getHours()).padStart(2, "0");
	const minute = String(now.getMinutes()).padStart(2, "0");

	return `${APP_FILENAME_PREFIX}-${year}-${month}-${day}-${hour}-${minute}.pdf`;
}

/**
 * Validation result interface
 */
export interface FilenameValidationResult {
	isValid: boolean;
	sanitized: string;
	original: string;
	warnings: string[];
}

/**
 * Validate and sanitize a filename with detailed feedback
 */
export function validateAndSanitizeFilename(
	filename: string,
): FilenameValidationResult {
	const result: FilenameValidationResult = {
		isValid: true,
		sanitized: filename,
		original: filename,
		warnings: [],
	};

	// Empty filename
	if (!filename.trim()) {
		result.warnings.push("Filename is empty");
		result.sanitized = generateFallbackFilename();
		result.isValid = false;
		return result;
	}

	// Sanitize
	const sanitized = sanitizeFilename(filename);

	// Check if sanitization changed the filename
	if (sanitized !== filename) {
		result.warnings.push(
			"Filename contains special characters that were sanitized",
		);
		result.isValid = false; // Changed filename means it needed cleaning
	}

	result.sanitized = sanitized;
	return result;
}
