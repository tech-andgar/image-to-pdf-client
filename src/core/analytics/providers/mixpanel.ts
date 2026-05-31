import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

declare global {
	interface Window {
		mixpanel?: {
			track(event: string, properties?: Record<string, unknown>): void;
			identify(id: string): void;
			people: {
				set(properties: Record<string, unknown>): void;
				increment(property: string, value?: number): void;
			};
			register(properties: Record<string, unknown>): void;
		};
	}
}

export class MixpanelProvider extends BaseProvider {
	readonly name = "mixpanel";

	isEnabled(): boolean {
		return !!window.mixpanel;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.mixpanel?.track(event.action, {
			category: event.category,
			value: event.value,
			...event.params,
		});
		if (event.category === "export") {
			window.mixpanel?.people.increment("total_exports");
		}
		if (event.category === "upload") {
			window.mixpanel?.people.increment("total_uploads");
		}
	}

	protected override onPerformance(event: AnalyticsEvent): void {
		window.mixpanel?.track(`perf:${event.action}`, {
			duration_ms: event.value,
			...event.params,
		});
	}

	protected override onFunnel(event: AnalyticsEvent): void {
		window.mixpanel?.track("Funnel Step", {
			step: event.value,
			step_name: event.params?.step_name,
			...event.params,
		});
	}

	override identify(sessionId: string): void {
		window.mixpanel?.identify(sessionId);
	}

	override setUserProperties(properties: UserProperties): void {
		window.mixpanel?.people.set(properties);
		window.mixpanel?.register(properties);
	}
}
