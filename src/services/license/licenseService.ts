import { LicenseService } from "../../core/license";
import type { LicenseInfo, ActivationResult } from "../../core/license";
import {
	FREE_MONTHLY_CREDITS,
	FREE_IMAGE_LIMIT,
	ACTIVATION_KEYS,
} from "./license.config";

export { FREE_IMAGE_LIMIT };
export { FREE_MONTHLY_CREDITS as FREE_MONTHLY_EXPORT_CREDITS };
export type { LicenseInfo, ActivationResult };

export const licenseService = new LicenseService({
	storageKey: "license_v1",
	freeMonthlyCredits: FREE_MONTHLY_CREDITS,
	freeItemLimit: FREE_IMAGE_LIMIT,
	activationKeys: ACTIVATION_KEYS,
	messages: {
		invalidKey: "Clave no válida",
		unlimitedActivated: "¡Acceso ilimitado activado!",
		creditsAdded: (count) => `+${count} créditos añadidos`,
	},
});
