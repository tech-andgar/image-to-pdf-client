import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

declare global {
	interface Window {
		amplitude?: {
			track(event: string, properties?: Record<string, unknown>): void;
			setUserId(id: string): void;
		};
	}
}

export class AmplitudeProvider extends BaseProvider {
	readonly name = "amplitude";

	isEnabled(): boolean {
		return !!window.amplitude;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.amplitude?.track(event.action, {
			category: event.category,
			value: event.value,
			...event.params,
		});
	}

	protected override onError(event: AnalyticsEvent): void {
		window.amplitude?.track("[Error] Occurred", {
			error_type: event.action,
			...event.params,
		});
	}

	protected override onPerformance(event: AnalyticsEvent): void {
		window.amplitude?.track(`[Performance] ${event.action}`, {
			duration_ms: event.value,
			...event.params,
		});
	}

	protected override onFunnel(event: AnalyticsEvent): void {
		window.amplitude?.track("[Funnel] Step Completed", {
			step_number: event.value,
			step_name: event.params?.step_name,
			...event.params,
		});
	}

	override identify(sessionId: string): void {
		window.amplitude?.setUserId(sessionId);
	}

	override setUserProperties(properties: UserProperties): void {
		window.amplitude?.track("$identify", {
			user_properties: { $set: properties },
		});
	}
}
