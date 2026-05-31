/** Max log entries kept in localStorage */
export const MAX_LOG_ENTRIES = 100;

/** Max user metric entries kept in localStorage */
export const MAX_METRIC_ENTRIES = 200;

/** Logger flush debounce in ms */
export const LOG_FLUSH_DEBOUNCE_MS = 1000;

/** localStorage keys */
export const STORAGE_KEYS = {
	LOGS: "app_logs",
	METRICS: "user_metrics",
	APP_NAME: "pwa-app-name",
} as const;
