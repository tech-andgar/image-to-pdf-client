import {
	MAX_LOG_ENTRIES,
	LOG_FLUSH_DEBOUNCE_MS,
	STORAGE_KEYS,
} from "../config/limits";

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

const CONSOLE_METHOD: Record<LogLevel, "log" | "warn" | "error"> = {
	[LogLevel.INFO]: "log",
	[LogLevel.WARN]: "warn",
	[LogLevel.ERROR]: "error",
};

class LoggerService {
	private logs: LogEntry[] = [];
	private flushTimer: ReturnType<typeof setTimeout> | null = null;
	readonly sessionId: string;

	constructor() {
		this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
		this.loadFromStorage();
		this.attachGlobalHandlers();
		this.info("Application started");
	}

	info(message: string, data?: unknown) {
		this.append(LogLevel.INFO, message, data);
	}

	warn(message: string, data?: unknown) {
		this.append(LogLevel.WARN, message, data);
	}

	error(message: string, data?: unknown) {
		this.append(LogLevel.ERROR, message, data);
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

	time(label: string) {
		console.time(label);
	}

	timeEnd(label: string) {
		console.timeEnd(label);
	}

	getLogs(): LogEntry[] {
		return [...this.logs];
	}

	clearLogs() {
		this.logs = [];
		this.flushToStorage();
	}

	exportLogs(): string {
		return JSON.stringify(this.logs, null, 2);
	}

	private append(level: LogLevel, message: string, data?: unknown) {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			data,
			userAgent: navigator.userAgent,
			url: window.location.href,
			sessionId: this.sessionId,
		};

		this.logs.push(entry);
		if (this.logs.length > MAX_LOG_ENTRIES) this.logs.shift();

		this.scheduleFlush();
		console[CONSOLE_METHOD[level]](
			`[${level.toUpperCase()}] ${message}`,
			data ?? "",
		);
	}

	private scheduleFlush() {
		if (this.flushTimer) return;
		this.flushTimer = setTimeout(() => {
			this.flushTimer = null;
			this.flushToStorage();
		}, LOG_FLUSH_DEBOUNCE_MS);
	}

	private flushToStorage() {
		try {
			localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
		} catch {
			// Storage full or unavailable — non-critical
		}
	}

	private loadFromStorage() {
		try {
			const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
			if (stored) this.logs = JSON.parse(stored);
		} catch {
			// Corrupted — start fresh
		}
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

export const logger = new LoggerService();

export function useLogger() {
	return logger;
}
