import { createContext, type ReactNode, useContext } from 'react';
import { type UseLicense, useLicense } from '../hooks/useLicense';

const LicenseContext = createContext<UseLicense | undefined>(undefined);

export function LicenseProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const license = useLicense();
  return (
    <LicenseContext.Provider value={license}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicenseContext(): UseLicense {
  const ctx = useContext(LicenseContext);
  if (!ctx)
    throw new Error('useLicenseContext must be used within LicenseProvider');
  return ctx;
}
