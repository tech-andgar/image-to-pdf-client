import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

declare global {
	interface Window {
		posthog?: {
			capture(event: string, properties?: Record<string, unknown>): void;
			identify(id: string, properties?: Record<string, unknown>): void;
			people: { set(properties: Record<string, unknown>): void };
			register(properties: Record<string, unknown>): void;
		};
	}
}

export class PostHogProvider extends BaseProvider {
	readonly name = "posthog";

	isEnabled(): boolean {
		return !!window.posthog;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.posthog?.capture(event.action, {
			category: event.category,
			value: event.value,
			...event.params,
		});
	}

	protected override onError(event: AnalyticsEvent): void {
		window.posthog?.capture("$exception", {
			$exception_message: this.getDescription(event),
			$exception_type: event.action,
			...event.params,
		});
	}

	protected override onPerformance(event: AnalyticsEvent): void {
		window.posthog?.capture("$performance", {
			metric: event.action,
			duration_ms: event.value,
			...event.params,
		});
	}

	protected override onFunnel(event: AnalyticsEvent): void {
		window.posthog?.capture("funnel_step", {
			step: event.value,
			step_name: event.params?.step_name,
			...event.params,
		});
	}

	override identify(sessionId: string): void {
		window.posthog?.identify(sessionId);
	}

	override setUserProperties(properties: UserProperties): void {
		window.posthog?.people.set(properties);
		window.posthog?.register(properties);
	}
}
