export interface LicenseConfig {
  storageKey: string;
  freeMonthlyCredits: number;
  freeItemLimit: number;
  activationKeys: Record<
    string,
    { type: 'unlimited' | 'pack'; credits?: number }
  >;
  messages: {
    invalidKey: string;
    unlimitedActivated: string;
    creditsAdded: (count: number) => string;
  };
}

export interface PackDefinition {
  key: string;
  type: 'unlimited' | 'pack';
  credits?: number;
  label: string;
  price: string;
  description: string;
}

export interface LicenseState {
  type: 'free' | 'unlimited' | 'pack';
  credits: number | null;
  monthKey: string;
  activatedKey?: string;
}

export interface LicenseInfo {
  type: 'free' | 'unlimited' | 'pack';
  credits: number | null;
  canExport: boolean;
  isPremium: boolean;
}

export interface ActivationResult {
  success: boolean;
  message: string;
}

export interface ILicenseStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}
