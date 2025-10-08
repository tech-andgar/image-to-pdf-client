/**
 * Simple logger service for client-side monitoring
 * Logs events, errors, and performance metrics to console and local storage
 */

export enum LogLevel {
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
}

export interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	data?: unknown;
	userAgent?: string;
	url?: string;
	sessionId?: string;
}

class LoggerService {
	private logs: LogEntry[] = [];
	private readonly maxLogs = 100; // Keep last 100 logs
	private readonly sessionId: string;

	constructor() {
		this.sessionId = this.generateSessionId();
		this.loadLogsFromStorage();

		// Log application start
		this.info("Application started", {
			userAgent: navigator.userAgent,
			url: window.location.href,
			timestamp: new Date().toISOString(),
		});

		// Setup global error handler
		window.addEventListener("unhandledrejection", (event) => {
			this.error("Unhandled promise rejection", {
				reason: event.reason,
				promise: event.promise,
			});
		});

		window.addEventListener("error", (event) => {
			this.error("Global JavaScript error", {
				message: event.message,
				source: event.filename,
				line: event.lineno,
				column: event.colno,
				error: event.error,
			});
		});
	}

	private generateSessionId(): string {
		return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
	}

	private loadLogsFromStorage() {
		try {
			const storedLogs = localStorage.getItem("app_logs");
			if (storedLogs) {
				this.logs = JSON.parse(storedLogs);
			}
		} catch (error) {
			console.warn("Failed to load logs from storage:", error);
		}
	}

	private saveLogsToStorage() {
		try {
			localStorage.setItem("app_logs", JSON.stringify(this.logs));
		} catch (error) {
			console.warn("Failed to save logs to storage:", error);
		}
	}

	private createLogEntry(
		level: LogLevel,
		message: string,
		data?: unknown,
	): LogEntry {
		return {
			timestamp: new Date().toISOString(),
			level,
			message,
			data,
			userAgent: navigator.userAgent,
			url: window.location.href,
			sessionId: this.sessionId,
		};
	}

	private log(level: LogLevel, message: string, data?: unknown) {
		const entry = this.createLogEntry(level, message, data);

		// Add to logs array
		this.logs.push(entry);

		// Keep only recent logs
		if (this.logs.length > this.maxLogs) {
			this.logs.shift();
		}

		// Save to storage
		this.saveLogsToStorage();

		// Console output - Get appropriate console method for log level
		let logMethod: "log" | "warn" | "error" = "log";
		if (level === LogLevel.ERROR) {
			logMethod = "error";
		} else if (level === LogLevel.WARN) {
			logMethod = "warn";
		}

		console[logMethod](`[${level.toUpperCase()}] ${message}`, data || "");
	}

	info(message: string, data?: unknown) {
		this.log(LogLevel.INFO, message, data);
	}

	warn(message: string, data?: unknown) {
		this.log(LogLevel.WARN, message, data);
	}

	error(message: string, data?: unknown) {
		this.log(LogLevel.ERROR, message, data);
	}

	// Performance monitoring
	time(label: string) {
		console.time(label);
	}

	timeEnd(label: string) {
		console.timeEnd(label);
	}

	// User interaction tracking
	trackUserAction(action: string, data?: unknown) {
		this.info(`User action: ${action}`, data);
	}

	// File operation tracking
	trackFileOperation(operation: string, fileCount: number, totalSize: number) {
		this.info(`File ${operation}`, {
			fileCount,
			totalSize,
			totalSizeMB: totalSize / (1024 * 1024),
		});
	}

	// PDF generation tracking
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

		// Track PDF generation performance
		this.time("pdf-generation");
	}

	trackPdfGenerated(success: boolean, fileSize?: number) {
		this.timeEnd("pdf-generation");

		this.info("PDF generation completed", {
			success,
			fileSize,
			fileSizeMB: fileSize ? fileSize / (1024 * 1024) : undefined,
		});
	}

	// Get all logs for export/debugging
	getLogs(): LogEntry[] {
		return [...this.logs];
	}

	// Clear all logs
	clearLogs() {
		this.logs = [];
		this.saveLogsToStorage();
		this.info("Logs cleared");
	}

	// Export logs as JSON (useful for bug reports)
	exportLogs(): string {
		return JSON.stringify(this.logs, null, 2);
	}
}

// Create singleton instance
export const logger = new LoggerService();

// React hook for component-level logging
export function useLogger() {
	return {
		info: logger.info.bind(logger),
		warn: logger.warn.bind(logger),
		error: logger.error.bind(logger),
		trackUserAction: logger.trackUserAction.bind(logger),
		trackFileOperation: logger.trackFileOperation.bind(logger),
		trackPdfGeneration: logger.trackPdfGeneration.bind(logger),
		trackPdfGenerated: logger.trackPdfGenerated.bind(logger),
	};
}
