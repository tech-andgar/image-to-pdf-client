import { LoggerService, LogLevel, type LogEntry } from "../core/logger";
import { analytics } from "../core/analytics";
import { STORAGE_KEYS } from "../config/limits";

export { LogLevel, type LogEntry };

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
		dataLayer?: unknown[];
	}
}

class AppLoggerService extends LoggerService {
	constructor() {
		super({ storageKey: STORAGE_KEYS.LOGS });
		this.attachGlobalHandlers();
		this.info("Application started");
	}

	override error(message: string, data?: unknown) {
		super.error(message, data);
		analytics.track({
			action: "exception",
			category: "error",
			params: { description: message, fatal: false },
		});
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
