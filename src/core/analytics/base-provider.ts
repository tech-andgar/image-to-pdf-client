import type {
	AnalyticsEvent,
	AnalyticsProvider,
	ConsentLevel,
	UserProperties,
} from "./types";

export abstract class BaseProvider implements AnalyticsProvider {
	abstract readonly name: string;
	readonly consentLevel: ConsentLevel = "analytics";
	abstract isEnabled(): boolean;

	track(event: AnalyticsEvent): void {
		switch (event.category) {
			case "error":
				this.onError(event);
				break;
			case "performance":
				this.onPerformance(event);
				break;
			case "funnel":
				this.onFunnel(event);
				break;
			default:
				this.onEvent(event);
				break;
		}
	}

	protected onError(event: AnalyticsEvent): void {
		this.onEvent(event);
	}

	protected onPerformance(event: AnalyticsEvent): void {
		this.onEvent(event);
	}

	protected onFunnel(event: AnalyticsEvent): void {
		this.onEvent(event);
	}

	protected abstract onEvent(event: AnalyticsEvent): void;

	identify?(_sessionId: string): void {}
	setUserProperties?(_properties: UserProperties): void {}

	protected getDescription(event: AnalyticsEvent): string {
		return (
			(event.params?.description as string) ??
			(event.params?.error_details as string) ??
			event.action
		);
	}
}
