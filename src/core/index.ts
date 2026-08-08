export {
  type AnalyticsConfig,
  type AnalyticsEvent,
  type AnalyticsProvider,
  analytics,
  type ConsentLevel,
  detectUserProperties,
  ESSENTIAL_CATEGORIES,
  type ProviderFactory,
  type UserProperties,
} from './analytics';

export { clampDimensions, MAX_CANVAS_PIXELS, MAX_IMAGE_PIXELS } from './image';
export {
  LOG_FLUSH_DEBOUNCE_MS,
  type LogEntry,
  type LoggerConfig,
  LoggerService,
  LogLevel,
  MAX_LOG_ENTRIES,
} from './logger';

export { localStorageAdapter, type StorageAdapter } from './storage';
export {
  hasPdfMagicBytes,
  hasValidSignature,
  IMAGE_SIGNATURES,
  type MagicSignature,
  PDF_MAGIC,
} from './validation';
