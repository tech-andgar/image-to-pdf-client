import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

declare global {
	interface Window {
		DD_RUM?: {
			addAction(name: string, context?: Record<string, unknown>): void;
			addTiming(name: string, time?: number): void;
			addError(error: Error, context?: Record<string, unknown>): void;
			setUser(user: Record<string, unknown>): void;
			setGlobalContext(context: Record<string, unknown>): void;
		};
	}
}

export class DatadogProvider extends BaseProvider {
	readonly name = "datadog";
	override readonly consentLevel = "essential" as const;

	isEnabled(): boolean {
		return !!window.DD_RUM;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.DD_RUM?.addAction(event.action, {
			category: event.category,
			value: event.value,
			...event.params,
		});
	}

	protected override onError(event: AnalyticsEvent): void {
		window.DD_RUM?.addError(new Error(this.getDescription(event)), {
			type: event.action,
			...event.params,
		});
	}

	protected override onPerformance(event: AnalyticsEvent): void {
		window.DD_RUM?.addTiming(event.action, event.value);
	}

	protected override onFunnel(event: AnalyticsEvent): void {
		window.DD_RUM?.addAction(`funnel:${event.params?.step_name}`, {
			step: event.value,
			...event.params,
		});
	}

	override identify(sessionId: string): void {
		window.DD_RUM?.setUser({ id: sessionId });
	}

	override setUserProperties(properties: UserProperties): void {
		window.DD_RUM?.setGlobalContext(properties);
	}
}
