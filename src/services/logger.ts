import { LoggerService, LogLevel, type LogEntry } from "../core/logger";
import { STORAGE_KEYS } from "../config/limits";

export { LogLevel, type LogEntry };

class AppLoggerService extends LoggerService {
	constructor() {
		super({ storageKey: STORAGE_KEYS.LOGS });
		this.attachGlobalHandlers();
		this.info("Application started");
	}

	trackUserAction(action: string, data?: unknown) {
		this.info(`User action: ${action}`, data);
	}

	trackFileOperation(operation: string, fileCount: number, totalSize: number) {
		this.info(`File ${operation}`, { fileCount, totalSize });
	}

	trackPdfGeneration(
		imageCount: number,
		compressionUsed: boolean,
		presetsUsed?: string[],
	) {
		this.info("PDF generation started", {
			imageCount,
			compressionUsed,
			presetsUsed,
		});
	}

	trackPdfGenerated(success: boolean, fileSize?: number) {
		this.info("PDF generation completed", { success, fileSize });
	}

	private attachGlobalHandlers() {
		window.addEventListener("unhandledrejection", (event) => {
			this.error("Unhandled promise rejection", { reason: event.reason });
		});

		window.addEventListener("error", (event) => {
			this.error("Global error", {
				message: event.message,
				source: event.filename,
				line: event.lineno,
			});
		});
	}
}

export const logger = new AppLoggerService();

export function useLogger() {
	return logger;
}
