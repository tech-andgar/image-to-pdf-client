import type { ILicenseStorage } from './types';

export class SignedStorage implements ILicenseStorage {
  private readonly secret: string;
  private readonly inner: ILicenseStorage;

  constructor(secret: string, inner?: ILicenseStorage) {
    this.secret = secret;
    this.inner = inner ?? {
      get: (k) => localStorage.getItem(k),
      set: (k, v) => localStorage.setItem(k, v),
      remove: (k) => localStorage.removeItem(k),
    };
  }

  get(key: string): string | null {
    const raw = this.inner.get(key);
    if (!raw) return null;
    try {
      const { payload, signature } = JSON.parse(raw);
      if (!payload || !signature) return null;
      const valid = this.verifySync(payload, signature);
      if (!valid) return null;
      return payload;
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    const signature = this.signSync(value);
    this.inner.set(key, JSON.stringify({ payload: value, signature }));
  }

  remove(key: string): void {
    this.inner.remove(key);
  }

  private signSync(payload: string): string {
    return this.hmacSync(payload);
  }

  private verifySync(payload: string, signature: string): boolean {
    return this.hmacSync(payload) === signature;
  }

  private hmacSync(payload: string): string {
    let hash = 0x811c9dc5;
    const combined = this.secret + ':' + payload;
    for (let i = 0; i < combined.length; i++) {
      hash ^= combined.codePointAt(i)!;
      hash = Math.imul(hash, 0x01000193);
    }
    let hash2 = 0x1f351f35;
    const reversed = payload + ':' + this.secret;
    for (let i = 0; i < reversed.length; i++) {
      hash2 ^= reversed.codePointAt(i)!;
      hash2 = Math.imul(hash2, 0x01000193);
    }
    return (hash >>> 0).toString(36) + (hash2 >>> 0).toString(36);
  }
}
