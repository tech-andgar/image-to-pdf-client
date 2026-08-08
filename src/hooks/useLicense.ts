import { useCallback, useState } from 'react';
import type { LicenseInfo } from '../core/license';
import { licenseService } from '../services/license/licenseService';

export interface LicenseDomain {
  info: LicenseInfo;
  consumeCredit: () => boolean;
  refundCredit: () => void;
  activateKey: (key: string) => { success: boolean; message: string };
  refresh: () => void;
}

export interface UseLicense extends LicenseDomain {
  paywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
}

function useLicenseDomain(): LicenseDomain {
  const [info, setInfo] = useState<LicenseInfo>(() => licenseService.getInfo());

  const refresh = useCallback(() => {
    setInfo(licenseService.getInfo());
  }, []);

  const consumeCredit = useCallback((): boolean => {
    const ok = licenseService.consumeCredit();
    refresh();
    return ok;
  }, [refresh]);

  const refundCredit = useCallback((): void => {
    licenseService.refundCredit();
    refresh();
  }, [refresh]);

  const activateKey = useCallback(
    (key: string) => {
      const result = licenseService.activateKey(key);
      refresh();
      return result;
    },
    [refresh],
  );

  return { info, consumeCredit, refundCredit, activateKey, refresh };
}

export function useLicense(): UseLicense {
  const domain = useLicenseDomain();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const consumeCredit = useCallback((): boolean => {
    const ok = domain.consumeCredit();
    if (!ok) setPaywallOpen(true);
    return ok;
  }, [domain]);

  return {
    ...domain,
    consumeCredit,
    paywallOpen,
    openPaywall: () => setPaywallOpen(true),
    closePaywall: () => setPaywallOpen(false),
  };
}
