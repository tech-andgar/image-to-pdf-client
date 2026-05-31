export {
	MAX_LOG_ENTRIES,
	LOG_FLUSH_DEBOUNCE_MS,
} from "../core/logger/config";

export const MAX_METRIC_ENTRIES = 200;

export const STORAGE_KEYS = {
	LOGS: "app_logs",
	METRICS: "user_metrics",
	APP_NAME: "pwa-app-name",
} as const;
