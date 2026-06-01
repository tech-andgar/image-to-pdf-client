import type {
	AnalyticsEvent,
	AnalyticsConfig,
	AnalyticsProvider,
	ProviderFactory,
	UserProperties,
} from "./types";
import { ESSENTIAL_CATEGORIES } from "./types";

export class AnalyticsService {
	private providers: AnalyticsProvider[] = [];
	private registry = new Map<string, ProviderFactory>();
	private timers = new Map<string, number>();
	private config: AnalyticsConfig = {};
	private queue: AnalyticsEvent[] = [];
	private ready = false;

	configure(config: AnalyticsConfig) {
		this.config = { ...this.config, ...config };
	}

	registerFactory(name: string, factory: ProviderFactory) {
		this.registry.set(name, factory);
	}

	register(provider: AnalyticsProvider) {
		if (this.config.disabledProviders?.includes(provider.name)) return;
		this.providers.push(provider);
	}

	unregister(name: string) {
		this.providers = this.providers.filter((p) => p.name !== name);
	}

	autoRegister() {
		for (const [name, factory] of this.registry) {
			if (this.providers.some((p) => p.name === name)) continue;
			if (this.config.disabledProviders?.includes(name)) continue;
			try {
				const provider = factory();
				if (provider.isEnabled()) {
					this.providers.push(provider);
				}
			} catch {
				// SDK not available
			}
		}
	}

	init() {
		this.autoRegister();
		this.ready = true;
		for (const event of this.queue) {
			this.dispatch(event);
		}
		this.queue = [];
	}

	track(event: AnalyticsEvent) {
		if (this.config.eventFilter && !this.config.eventFilter(event)) return;

		const enriched: AnalyticsEvent = {
			...event,
			params: { ...this.config.globalParams, ...event.params },
		};

		if (this.config.debug) {
			console.debug("[analytics]", enriched.action, enriched);
		}

		if (!this.ready) {
			this.queue.push(enriched);
			return;
		}
		this.dispatch(enriched);
	}

	private dispatch(event: AnalyticsEvent) {
		const isEssential = ESSENTIAL_CATEGORIES.includes(event.category);
		for (const provider of this.providers) {
			if (!provider.isEnabled()) continue;
			if (this.config.disabledProviders?.includes(provider.name)) continue;
			if (provider.consentLevel === "essential" && !isEssential) continue;
			try {
				provider.track(event);
			} catch {
				// Provider failure should not break the app
			}
		}
	}

	timeStart(label: string) {
		this.timers.set(label, performance.now());
	}

	timeEnd(label: string) {
		const start = this.timers.get(label);
		if (start === undefined) return;
		this.timers.delete(label);
		const duration_ms = Math.round(performance.now() - start);
		const duration_s = Math.round(duration_ms / 100) / 10; // 1 decimal second
		this.track({
			action: `app_${label}`,
			category: "performance",
			value: duration_s,
			params: { duration_ms },
		});
	}

	identify(sessionId: string) {
		for (const provider of this.providers) {
			if (provider.isEnabled() && provider.identify) {
				provider.identify(sessionId);
			}
		}
	}

	setUserProperties(properties: UserProperties) {
		for (const provider of this.providers) {
			if (provider.isEnabled() && provider.setUserProperties) {
				try {
					provider.setUserProperties(properties);
				} catch {
					// Non-critical
				}
			}
		}
	}

	trackFunnel(step: number, name: string, params?: Record<string, unknown>) {
		this.track({
			action: "funnel_step",
			category: "funnel",
			value: step,
			params: { step_name: name, ...params },
		});
	}

	getProviders(): string[] {
		return this.providers.map((p) => p.name);
	}

	getActiveProviders(): string[] {
		return this.providers.filter((p) => p.isEnabled()).map((p) => p.name);
	}

	isProviderActive(name: string): boolean {
		return this.providers.some((p) => p.name === name && p.isEnabled());
	}
}
