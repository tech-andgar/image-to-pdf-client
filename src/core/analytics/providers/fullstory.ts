import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

declare global {
	interface Window {
		FS?: {
			event(name: string, properties?: Record<string, unknown>): void;
			identify(uid: string, properties?: Record<string, unknown>): void;
			setUserVars(properties: Record<string, unknown>): void;
			log(level: "log" | "info" | "warn" | "error", message: string): void;
		};
	}
}

export class FullStoryProvider extends BaseProvider {
	readonly name = "fullstory";

	isEnabled(): boolean {
		return !!window.FS;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.FS?.event(event.action, {
			category: event.category,
			value: event.value,
			...event.params,
		});
	}

	protected override onError(event: AnalyticsEvent): void {
		window.FS?.log("error", this.getDescription(event));
		this.onEvent(event);
	}

	protected override onPerformance(event: AnalyticsEvent): void {
		window.FS?.event(`perf_${event.action}`, {
			duration_ms: event.value,
			...event.params,
		});
	}

	protected override onFunnel(event: AnalyticsEvent): void {
		window.FS?.event("funnel_progress", {
			step: event.value,
			step_name: event.params?.step_name,
			...event.params,
		});
	}

	override identify(sessionId: string): void {
		window.FS?.identify(sessionId);
	}

	override setUserProperties(properties: UserProperties): void {
		window.FS?.setUserVars(properties);
	}
}
