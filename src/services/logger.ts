import { STORAGE_KEYS } from '../config/limits';
import { analytics } from '../core/analytics';
import { type LogEntry, LoggerService, LogLevel } from '../core/logger';

export { type LogEntry, LogLevel };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

class AppLoggerService extends LoggerService {
  private rejectionHandler: ((event: PromiseRejectionEvent) => void) | null =
    null;
  private errorHandler: ((event: ErrorEvent) => void) | null = null;

  constructor() {
    super({ storageKey: STORAGE_KEYS.LOGS });
    this.attachGlobalHandlers();
    this.info('Application started');
  }

  override error(message: string, data?: unknown) {
    super.error(message, data);
    analytics.track({
      action: 'app_exception',
      category: 'error',
      params: { description: message, fatal: false },
    });
  }

  destroy() {
    if (this.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
    }
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
    }
  }

  private attachGlobalHandlers() {
    this.rejectionHandler = (event) => {
      this.error('Unhandled promise rejection', { reason: event.reason });
    };
    this.errorHandler = (event) => {
      this.error('Global error', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
      });
    };
    window.addEventListener('unhandledrejection', this.rejectionHandler);
    window.addEventListener('error', this.errorHandler);
  }
}

export const logger = new AppLoggerService();
