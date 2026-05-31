export {
	LoggerService,
	LogLevel,
	type LogEntry,
	type LoggerConfig,
	MAX_LOG_ENTRIES,
	LOG_FLUSH_DEBOUNCE_MS,
} from "./logger";

export { MAX_CANVAS_PIXELS, MAX_IMAGE_PIXELS, clampDimensions } from "./image";

export {
	IMAGE_SIGNATURES,
	PDF_MAGIC,
	hasValidSignature,
	hasPdfMagicBytes,
	type MagicSignature,
} from "./validation";

export { type StorageAdapter, localStorageAdapter } from "./storage";

export {
	analytics,
	detectUserProperties,
	ESSENTIAL_CATEGORIES,
	type AnalyticsEvent,
	type AnalyticsProvider,
	type AnalyticsConfig,
	type ProviderFactory,
	type UserProperties,
	type ConsentLevel,
} from "./analytics";
