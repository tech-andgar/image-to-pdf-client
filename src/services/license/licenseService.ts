import { LicenseService, SignedStorage } from "../../core/license";

import {
	FREE_MONTHLY_CREDITS,
	FREE_IMAGE_LIMIT,
	ACTIVATION_KEYS,
} from "./license.config";

export { FREE_IMAGE_LIMIT };
export { FREE_MONTHLY_CREDITS as FREE_MONTHLY_EXPORT_CREDITS };

const LICENSE_SECRET =
	import.meta.env.VITE_LICENSE_SECRET ?? "dev-fallback-key";

const storage = new SignedStorage(LICENSE_SECRET);

export const licenseService = new LicenseService(
	{
		storageKey: "license_v1",
		freeMonthlyCredits: FREE_MONTHLY_CREDITS,
		freeItemLimit: FREE_IMAGE_LIMIT,
		activationKeys: ACTIVATION_KEYS,
		messages: {
			invalidKey: "Clave no válida",
			unlimitedActivated: "¡Acceso ilimitado activado!",
			creditsAdded: (count) => `+${count} créditos añadidos`,
		},
	},
	storage,
);

export { type LicenseInfo, type ActivationResult } from "../../core/license";
