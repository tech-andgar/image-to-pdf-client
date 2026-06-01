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
}

export interface LogSession {
	sessionId: string;
	userAgent: string;
	startedAt: string;
	entries: LogEntry[];
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
		const session: LogSession = {
			sessionId: this.sessionId,
			userAgent: navigator.userAgent,
			startedAt: new Date().toISOString(),
			entries: this.logs,
		};
		return JSON.stringify(session, null, 2);
	}

	time(label: string) {
		console.time(label);
	}

	timeEnd(label: string) {
		console.timeEnd(label);
	}

	private append(level: LogLevel, message: string, data?: unknown) {
		const entry = this.toEntry(level, message, data);

		// Only persist warn/error — info is operational noise not needed for bug reports
		if (level !== LogLevel.INFO) {
			this.persist(entry);
		}

		console[CONSOLE_METHOD[level]](
			`[${level.toUpperCase()}] ${message}`,
			data ?? "",
		);
	}

	private toEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
		return {
			timestamp: new Date().toISOString(),
			level,
			message,
			...(data === undefined ? {} : { data }),
		};
	}

	private persist(entry: LogEntry) {
		this.logs.push(entry);
		if (this.logs.length > this.maxEntries) this.logs.shift();
		this.scheduleFlush();
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
			if (!stored) return;
			const parsed: unknown[] = JSON.parse(stored);
			// Strip legacy per-entry userAgent/url/sessionId; drop info noise
			this.logs = parsed
				.map((raw) => {
					const { timestamp, level, message, data } = raw as Record<
						string,
						unknown
					>;
					return {
						timestamp,
						level,
						message,
						...(data === undefined ? {} : { data }),
					} as LogEntry;
				})
				.filter((e) => e.level !== LogLevel.INFO);
		} catch {
			// Corrupted — start fresh
		}
	}
}

export { MAX_LOG_ENTRIES, LOG_FLUSH_DEBOUNCE_MS, DEFAULT_LOG_STORAGE_KEY };
