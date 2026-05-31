import type { AnalyticsEvent, UserProperties } from "../types";
import { BaseProvider } from "../base-provider";

declare global {
	interface Window {
		hj?: (command: string, ...args: unknown[]) => void;
	}
}

export class HotjarProvider extends BaseProvider {
	readonly name = "hotjar";

	isEnabled(): boolean {
		return !!window.hj;
	}

	protected onEvent(event: AnalyticsEvent): void {
		window.hj?.("event", event.action);
	}

	protected override onError(event: AnalyticsEvent): void {
		window.hj?.("tagRecording", [`error:${event.action}`]);
	}

	protected override onFunnel(event: AnalyticsEvent): void {
		window.hj?.("tagRecording", [`funnel:${event.params?.step_name}`]);
		window.hj?.("event", `funnel_${event.params?.step_name}`);
	}

	override identify(sessionId: string): void {
		window.hj?.("identify", sessionId, {});
	}

	override setUserProperties(properties: UserProperties): void {
		window.hj?.("identify", null, properties);
	}
}
