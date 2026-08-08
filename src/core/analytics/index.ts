export { detectUserProperties } from './detect';
export { AnalyticsService } from './service';
export type {
  AnalyticsConfig,
  AnalyticsEvent,
  AnalyticsProvider,
  BaseCategory,
  ConsentLevel,
  EventAction,
  EventCategory,
  ProviderFactory,
  UserProperties,
} from './types';
export { ESSENTIAL_CATEGORIES } from './types';

import { AnalyticsService } from './service';

export const analytics = new AnalyticsService();
