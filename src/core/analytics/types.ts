export type BaseCategory = "interaction" | "error" | "performance" | "funnel";

export type EventCategory = BaseCategory | (string & {});
export type EventAction = string & {};

export interface AnalyticsEvent<
	TCategory extends string = EventCategory,
	TAction extends string = EventAction,
> {
	action: TAction;
	category: TCategory;
	label?: string;
	value?: number;
	params?: Record<string, unknown>;
}

export interface UserProperties {
	device_type: "mobile" | "tablet" | "desktop";
	app_mode: "pwa" | "browser";
	returning_user: boolean;
	screen_size: string;
	language: string;
	timezone: string;
	connection_type: string;
	browser: string;
	os: string;
	session_count: number;
}

export type ConsentLevel = "essential" | "analytics";

export const ESSENTIAL_CATEGORIES: readonly string[] = ["error", "performance"];

export interface AnalyticsProvider {
	readonly name: string;
	readonly consentLevel: ConsentLevel;
	isEnabled(): boolean;
	track(event: AnalyticsEvent): void;
	identify?(sessionId: string): void;
	setUserProperties?(properties: UserProperties): void;
}

export type ProviderFactory = () => AnalyticsProvider;

export interface AnalyticsConfig {
	debug?: boolean;
	globalParams?: Record<string, unknown>;
	disabledProviders?: string[];
	eventFilter?: (event: AnalyticsEvent) => boolean;
}
