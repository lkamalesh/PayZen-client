import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import type { AuthSession } from '@/types/auth';

interface MerchantAccessCacheEntry {
  merchantId: string;
  apiKey: string;
}

const defaultSession: AuthSession = {
  token: null,
  merchant: null,
  apiKey: null,
  email: null,
  role: 'Unknown',
};

export const authSessionStorage = {
  read(): AuthSession {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.authSession);
      if (!raw) return defaultSession;
      const parsed = JSON.parse(raw) as AuthSession;
      return {
        token: parsed.token ?? null,
        merchant: parsed.merchant ?? null,
        apiKey: parsed.apiKey ?? null,
        email: parsed.email ?? null,
        role: parsed.role ?? 'Unknown',
      };
    } catch {
      return defaultSession;
    }
  },
  write(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.authSession);
  },
};

export const getDefaultSession = (): AuthSession => ({ ...defaultSession });

const normalizeEmailKey = (email: string): string => email.trim().toLowerCase();

const readMerchantAccessCache = (): Record<string, MerchantAccessCacheEntry> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.merchantAccessByEmail);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, MerchantAccessCacheEntry>;
  } catch {
    return {};
  }
};

const writeMerchantAccessCache = (cache: Record<string, MerchantAccessCacheEntry>): void => {
  localStorage.setItem(STORAGE_KEYS.merchantAccessByEmail, JSON.stringify(cache));
};

export const merchantAccessCacheStorage = {
  readByEmail(email: string): MerchantAccessCacheEntry | null {
    const cache = readMerchantAccessCache();
    return cache[normalizeEmailKey(email)] ?? null;
  },
  writeByEmail(email: string, access: MerchantAccessCacheEntry): void {
    const cache = readMerchantAccessCache();
    cache[normalizeEmailKey(email)] = access;
    writeMerchantAccessCache(cache);
  },
};
