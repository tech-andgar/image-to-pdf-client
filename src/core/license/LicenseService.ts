import type {
	LicenseConfig,
	LicenseState,
	LicenseInfo,
	ActivationResult,
	ILicenseStorage,
} from "./types";

export class LicenseService {
	private readonly config: LicenseConfig;
	private readonly storage: ILicenseStorage;

	constructor(config: LicenseConfig, storage?: ILicenseStorage) {
		this.config = config;
		this.storage = storage ?? {
			get: (k) => localStorage.getItem(k),
			set: (k, v) => localStorage.setItem(k, v),
			remove: (k) => localStorage.removeItem(k),
		};
	}

	private currentMonthKey(): string {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	}

	private load(): LicenseState {
		try {
			const raw = this.storage.get(this.config.storageKey);
			if (raw) {
				const state: LicenseState = JSON.parse(raw);
				if (
					state.type === "free" &&
					state.monthKey !== this.currentMonthKey()
				) {
					return this.init();
				}
				return state;
			}
		} catch {}
		return this.init();
	}

	private init(): LicenseState {
		const state: LicenseState = {
			type: "free",
			credits: this.config.freeMonthlyCredits,
			monthKey: this.currentMonthKey(),
		};
		this.save(state);
		return state;
	}

	private save(state: LicenseState): void {
		this.storage.set(this.config.storageKey, JSON.stringify(state));
	}

	getInfo(): LicenseInfo {
		const state = this.load();
		const canExport = state.credits === null || state.credits > 0;
		const isPremium = state.type !== "free";
		return { type: state.type, credits: state.credits, canExport, isPremium };
	}

	consumeCredit(): boolean {
		const state = this.load();
		if (state.credits === null) return true;
		if (state.credits <= 0) return false;
		state.credits -= 1;
		this.save(state);
		return true;
	}

	refundCredit(): void {
		const state = this.load();
		if (state.credits === null) return;
		state.credits += 1;
		this.save(state);
	}

	activateKey(key: string): ActivationResult {
		const trimmed = key.trim().toUpperCase();
		const match = this.config.activationKeys[trimmed];
		if (!match)
			return { success: false, message: this.config.messages.invalidKey };

		const state = this.load();
		if (match.type === "unlimited") {
			state.type = "unlimited";
			state.credits = null;
		} else if (match.type === "pack" && match.credits) {
			state.type = "pack";
			state.credits = (state.credits ?? 0) + match.credits;
		}
		state.activatedKey = trimmed;
		this.save(state);
		return {
			success: true,
			message:
				match.type === "unlimited"
					? this.config.messages.unlimitedActivated
					: this.config.messages.creditsAdded(match.credits ?? 0),
		};
	}

	reset(): void {
		this.storage.remove(this.config.storageKey);
	}
}
