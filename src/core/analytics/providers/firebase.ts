import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

declare global {
	interface Window {
		firebase?: {
			analytics(): {
				logEvent(name: string, params?: Record<string, unknown>): void;
				setUserId(id: string): void;
				setUserProperties(properties: Record<string, string>): void;
			};
			performance(): {
				trace(name: string): {
					start(): void;
					stop(): void;
					putMetric(name: string, value: number): void;
					putAttribute(name: string, value: string): void;
				};
			};
			crashlytics(): {
				log(message: string): void;
				recordError(error: Error): void;
				setUserId(id: string): void;
				setCustomKey(key: string, value: string): void;
			};
		};
	}
}

export class FirebaseProvider extends BaseProvider {
	readonly name = "firebase";

	isEnabled(): boolean {
		return !!window.firebase;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.firebase?.analytics().logEvent(event.action, {
			category: event.category,
			value: event.value,
			...event.params,
		});
	}

	protected override onError(event: AnalyticsEvent): void {
		const description = this.getDescription(event);
		window.firebase?.crashlytics().log(description);
		window.firebase?.crashlytics().recordError(new Error(description));
		window.firebase?.analytics().logEvent("app_exception", {
			description,
			fatal: false,
			...event.params,
		});
	}

	protected override onPerformance(event: AnalyticsEvent): void {
		const trace = window.firebase?.performance().trace(event.action);
		if (trace && event.value) {
			trace.start();
			trace.putMetric("duration_ms", event.value);
			if (event.params) {
				for (const [key, val] of Object.entries(event.params)) {
					trace.putAttribute(key, String(val));
				}
			}
			trace.stop();
		}
		window.firebase?.analytics().logEvent(`perf_${event.action}`, {
			duration_ms: event.value,
			...event.params,
		});
	}

	protected override onFunnel(event: AnalyticsEvent): void {
		window.firebase?.analytics().logEvent("funnel_step", {
			step_number: event.value,
			step_name: event.params?.step_name,
			...event.params,
		});
	}

	override identify(sessionId: string): void {
		window.firebase?.analytics().setUserId(sessionId);
		window.firebase?.crashlytics().setUserId(sessionId);
	}

	override setUserProperties(properties: UserProperties): void {
		const fa = window.firebase?.analytics();
		const crash = window.firebase?.crashlytics();
		for (const [key, value] of Object.entries(properties)) {
			fa?.setUserProperties({ [key]: String(value) });
			crash?.setCustomKey(key, String(value));
		}
	}
}
