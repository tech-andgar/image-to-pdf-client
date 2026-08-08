const STORAGE_KEY = "license_v1";
const FREE_MONTHLY_CREDITS = 5;

// Mock keys — swap for backend validation later
const MOCK_KEYS: Record<
	string,
	{ type: "unlimited" | "pack"; credits?: number }
> = {
	"PREMIUM-UNLIMITED": { type: "unlimited" },
	"PACK-50": { type: "pack", credits: 50 },
	"PACK-200": { type: "pack", credits: 200 },
};

interface LicenseState {
	type: "free" | "unlimited" | "pack";
	credits: number | null; // null = unlimited
	monthKey: string; // "2024-05" — for monthly reset
	activatedKey?: string;
}

function currentMonthKey(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function load(): LicenseState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const state: LicenseState = JSON.parse(raw);
			// Reset free credits on new month
			if (state.type === "free" && state.monthKey !== currentMonthKey()) {
				return init();
			}
			return state;
		}
	} catch {}
	return init();
}

function init(): LicenseState {
	const state: LicenseState = {
		type: "free",
		credits: FREE_MONTHLY_CREDITS,
		monthKey: currentMonthKey(),
	};
	save(state);
	return state;
}

function save(state: LicenseState): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const FREE_IMAGE_LIMIT = 10;
export const FREE_MONTHLY_EXPORT_CREDITS = FREE_MONTHLY_CREDITS;

export interface LicenseInfo {
	type: "free" | "unlimited" | "pack";
	credits: number | null;
	canExport: boolean;
	isPremium: boolean; // unlimited or paid pack
}

export const licenseService = {
	getInfo(): LicenseInfo {
		const state = load();
		const canExport = state.credits === null || state.credits > 0;
		const isPremium = state.type !== "free";
		return { type: state.type, credits: state.credits, canExport, isPremium };
	},

	consumeCredit(): boolean {
		const state = load();
		if (state.credits === null) return true; // unlimited
		if (state.credits <= 0) return false;
		state.credits -= 1;
		save(state);
		return true;
	},

	activateKey(key: string): { success: boolean; message: string } {
		const trimmed = key.trim().toUpperCase();
		const mock = MOCK_KEYS[trimmed];
		if (!mock) return { success: false, message: "Clave no válida" };

		const state = load();
		if (mock.type === "unlimited") {
			state.type = "unlimited";
			state.credits = null;
		} else if (mock.type === "pack" && mock.credits) {
			state.type = "pack";
			state.credits = (state.credits ?? 0) + mock.credits;
		}
		state.activatedKey = trimmed;
		save(state);
		return {
			success: true,
			message:
				mock.type === "unlimited"
					? "¡Acceso ilimitado activado!"
					: `+${mock.credits} créditos añadidos`,
		};
	},

	reset(): void {
		localStorage.removeItem(STORAGE_KEY);
	},
};
