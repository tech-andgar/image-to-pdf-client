import { FREE_MONTHLY_CREDITS, FREE_IMAGE_LIMIT, ACTIVATION_KEYS } from "./license.config";

export { FREE_IMAGE_LIMIT };
export { FREE_MONTHLY_CREDITS as FREE_MONTHLY_EXPORT_CREDITS };

const STORAGE_KEY = "license_v1";

interface LicenseState {
	type: "free" | "unlimited" | "pack";
	credits: number | null; // null = unlimited
	monthKey: string; // "2024-05" — for monthly reset
	activatedKey?: string;
}

export interface LicenseInfo {
	type: "free" | "unlimited" | "pack";
	credits: number | null;
	canExport: boolean;
	isPremium: boolean;
}

class LicenseService {
	private static instance: LicenseService;

	static getInstance(): LicenseService {
		if (!LicenseService.instance) {
			LicenseService.instance = new LicenseService();
		}
		return LicenseService.instance;
	}

	private currentMonthKey(): string {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	}

	private load(): LicenseState {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const state: LicenseState = JSON.parse(raw);
				if (state.type === "free" && state.monthKey !== this.currentMonthKey()) {
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
			credits: FREE_MONTHLY_CREDITS,
			monthKey: this.currentMonthKey(),
		};
		this.save(state);
		return state;
	}

	private save(state: LicenseState): void {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

	activateKey(key: string): { success: boolean; message: string } {
		const trimmed = key.trim().toUpperCase();
		const match = ACTIVATION_KEYS[trimmed];
		if (!match) return { success: false, message: "Clave no válida" };

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
					? "¡Acceso ilimitado activado!"
					: `+${match.credits} créditos añadidos`,
		};
	}

	reset(): void {
		localStorage.removeItem(STORAGE_KEY);
	}
}

export const licenseService = LicenseService.getInstance();
