import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

declare global {
	interface Window {
		Sentry?: {
			captureException(error: unknown, context?: Record<string, unknown>): void;
			captureMessage(message: string, level?: string): void;
			setUser(user: Record<string, unknown> | null): void;
			setContext(name: string, context: Record<string, unknown>): void;
			setTag(key: string, value: string): void;
			addBreadcrumb(breadcrumb: {
				category?: string;
				message?: string;
				level?: string;
				data?: Record<string, unknown>;
			}): void;
		};
	}
}

export class SentryProvider extends BaseProvider {
	readonly name = "sentry";
	override readonly consentLevel = "essential" as const;

	isEnabled(): boolean {
		return !!window.Sentry;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.Sentry?.addBreadcrumb({
			category: event.category,
			message: event.action,
			level: "info",
			data: { value: event.value, ...event.params },
		});
	}

	protected override onError(event: AnalyticsEvent): void {
		window.Sentry?.captureMessage(this.getDescription(event), "error");
	}

	protected override onPerformance(event: AnalyticsEvent): void {
		window.Sentry?.addBreadcrumb({
			category: "performance",
			message: event.action,
			level: "info",
			data: { duration_ms: event.value },
		});
	}

	override identify(sessionId: string): void {
		window.Sentry?.setUser({ id: sessionId });
	}

	override setUserProperties(properties: UserProperties): void {
		window.Sentry?.setContext("user_properties", properties);
		window.Sentry?.setTag("device_type", properties.device_type);
		window.Sentry?.setTag("app_mode", properties.app_mode);
	}
}
