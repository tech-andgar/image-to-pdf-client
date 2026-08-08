import { useState, useCallback } from "react";
import {
	licenseService,
	type LicenseInfo,
} from "../services/license/licenseService";

export interface UseLicense {
	info: LicenseInfo;
	paywallOpen: boolean;
	activateKey: (key: string) => { success: boolean; message: string };
	openPaywall: () => void;
	closePaywall: () => void;
	consumeCredit: () => boolean;
	refresh: () => void;
}

export function useLicense(): UseLicense {
	const [info, setInfo] = useState<LicenseInfo>(() => licenseService.getInfo());
	const [paywallOpen, setPaywallOpen] = useState(false);

	const refresh = useCallback(() => {
		setInfo(licenseService.getInfo());
	}, []);

	const consumeCredit = useCallback((): boolean => {
		const ok = licenseService.consumeCredit();
		refresh();
		if (!ok) setPaywallOpen(true);
		return ok;
	}, [refresh]);

	const activateKey = useCallback(
		(key: string) => {
			const result = licenseService.activateKey(key);
			refresh();
			return result;
		},
		[refresh],
	);

	return {
		info,
		paywallOpen,
		activateKey,
		openPaywall: () => setPaywallOpen(true),
		closePaywall: () => setPaywallOpen(false),
		consumeCredit,
		refresh,
	};
}
