import {
	MAX_LOG_ENTRIES,
	LOG_FLUSH_DEBOUNCE_MS,
	DEFAULT_LOG_STORAGE_KEY,
} from "./config";

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

export interface LoggerConfig {
	maxEntries?: number;
	flushDebounceMs?: number;
	storageKey?: string;
}

const CONSOLE_METHOD: Record<LogLevel, "log" | "warn" | "error"> = {
	[LogLevel.INFO]: "log",
	[LogLevel.WARN]: "warn",
	[LogLevel.ERROR]: "error",
};

export class LoggerService {
	private logs: LogEntry[] = [];
	private flushTimer: ReturnType<typeof setTimeout> | null = null;
	readonly sessionId: string;
	private readonly maxEntries: number;
	private readonly flushDebounceMs: number;
	private readonly storageKey: string;

	constructor(config: LoggerConfig = {}) {
		this.maxEntries = config.maxEntries ?? MAX_LOG_ENTRIES;
		this.flushDebounceMs = config.flushDebounceMs ?? LOG_FLUSH_DEBOUNCE_MS;
		this.storageKey = config.storageKey ?? DEFAULT_LOG_STORAGE_KEY;
		this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
		this.loadFromStorage();
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

	time(label: string) {
		console.time(label);
	}

	timeEnd(label: string) {
		console.timeEnd(label);
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
		if (this.logs.length > this.maxEntries) this.logs.shift();

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
		}, this.flushDebounceMs);
	}

	private flushToStorage() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
		} catch {
			// Storage full or unavailable
		}
	}

	private loadFromStorage() {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (stored) this.logs = JSON.parse(stored);
		} catch {
			// Corrupted — start fresh
		}
	}
}

export { MAX_LOG_ENTRIES, LOG_FLUSH_DEBOUNCE_MS, DEFAULT_LOG_STORAGE_KEY };
