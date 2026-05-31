import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

export class GoogleAnalyticsProvider extends BaseProvider {
	readonly name = "google-analytics";
	override readonly consentLevel = "essential" as const;

	isEnabled(): boolean {
		return !!window.gtag;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.gtag?.("event", event.action, {
			event_category: event.category,
			event_label: event.label,
			value: event.value,
			...event.params,
		});
	}

	override identify(sessionId: string): void {
		window.gtag?.("set", { session_id: sessionId });
	}

	override setUserProperties(properties: UserProperties): void {
		window.gtag?.("set", "user_properties", properties);
	}
}
