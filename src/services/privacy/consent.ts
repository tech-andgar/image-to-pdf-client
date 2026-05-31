const CONSENT_KEY = "gdpr_consent";

export type ConsentCategory = "analytics" | "functional";

export interface ConsentState {
	analytics: boolean;
	functional: boolean;
	timestamp: string;
}

const DEFAULT_CONSENT: ConsentState = {
	analytics: false,
	functional: true,
	timestamp: "",
};

class ConsentService {
	private state: ConsentState;

	constructor() {
		this.state = this.load();
	}

	get hasDecided(): boolean {
		return this.state.timestamp !== "";
	}

	get analytics(): boolean {
		return this.state.analytics;
	}

	get functional(): boolean {
		return this.state.functional;
	}

	getState(): ConsentState {
		return { ...this.state };
	}

	accept(categories: Partial<Pick<ConsentState, "analytics">>) {
		this.state = {
			functional: true,
			analytics: categories.analytics ?? false,
			timestamp: new Date().toISOString(),
		};
		this.save();
		this.applyToGtag();
	}

	acceptAll() {
		this.accept({ analytics: true });
	}

	rejectOptional() {
		this.accept({ analytics: false });
	}

	reset() {
		this.state = { ...DEFAULT_CONSENT };
		localStorage.removeItem(CONSENT_KEY);
		this.applyToGtag();
	}

	applyToGtag() {
		if (!window.gtag) return;
		const granted = this.state.analytics ? "granted" : "denied";
		window.gtag("consent", "update", {
			analytics_storage: granted,
			ad_storage: "denied",
			ad_user_data: "denied",
			ad_personalization: "denied",
		});
	}

	private load(): ConsentState {
		try {
			const stored = localStorage.getItem(CONSENT_KEY);
			if (stored) return JSON.parse(stored);
		} catch {
			// corrupted
		}
		return { ...DEFAULT_CONSENT };
	}

	private save() {
		localStorage.setItem(CONSENT_KEY, JSON.stringify(this.state));
	}
}

export const consentService = new ConsentService();
