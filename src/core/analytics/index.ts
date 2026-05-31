export type {
	BaseCategory,
	EventCategory,
	EventAction,
	AnalyticsEvent,
	UserProperties,
	AnalyticsProvider,
	ProviderFactory,
	AnalyticsConfig,
	ConsentLevel,
} from "./types";

export { ESSENTIAL_CATEGORIES } from "./types";

export { detectUserProperties } from "./detect";
export { AnalyticsService } from "./service";

import { AnalyticsService } from "./service";

export const analytics = new AnalyticsService();
