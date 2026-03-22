import { createContext, useContext, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { merchantApi } from '@/api/merchantApi';
import {
  getDefaultSession,
  authSessionStorage,
  merchantAccessCacheStorage,
} from '@/shared/utils/storage';
import { extractMerchantAccessFromToken, extractRoleFromToken } from '@/shared/utils/jwt';
import type { AuthSession, MerchantResponseDto } from '@/types/auth';

interface AuthContextValue {
  session: AuthSession;
  isAuthenticated: boolean;
  setToken: (token: string, email: string) => void;
  setMerchant: (merchant: MerchantResponseDto) => void;
  hydrateMerchantSession: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession>(() => authSessionStorage.read());

  const persist = (updater: (prev: AuthSession) => AuthSession) => {
    setSession((prev) => {
      const next = updater(prev);
      authSessionStorage.write(next);
      return next;
    });
  };

  const setToken = (token: string, email: string) => {
    const role = extractRoleFromToken(token);
    const merchantAccess = extractMerchantAccessFromToken(token);

    persist((prev) => {
      const resolvedMerchantId = merchantAccess.merchantId ?? prev.merchant?.merchantId ?? null;
      const resolvedApiKey = merchantAccess.apiKey ?? prev.apiKey ?? prev.merchant?.apiKey ?? null;

      return {
        ...prev,
        token,
        email,
        role,
        apiKey: resolvedApiKey,
        merchant:
          prev.merchant ?? (resolvedMerchantId
            ? {
                merchantId: resolvedMerchantId,
                apiKey: resolvedApiKey ?? '',
                email,
              }
            : null),
      };
    });
  };

  const setMerchant = (merchant: MerchantResponseDto) => {
    persist((prev) => {
      const effectiveEmail = (merchant.email ?? prev.email)?.trim().toLowerCase() ?? null;
      if (effectiveEmail && merchant.apiKey) {
        merchantAccessCacheStorage.writeByEmail(effectiveEmail, {
          merchantId: merchant.merchantId,
          apiKey: merchant.apiKey,
        });
      }

      return {
        ...prev,
        merchant,
        apiKey: merchant.apiKey,
      };
    });
  };

  const hydrateMerchantSession = async (email: string): Promise<void> => {
    const emailKey = email.trim().toLowerCase();

    const cachedAccess = merchantAccessCacheStorage.readByEmail(emailKey);
    if (cachedAccess) {
      persist((prev) => ({
        ...prev,
        merchant:
          prev.merchant ?? {
            merchantId: cachedAccess.merchantId,
            apiKey: cachedAccess.apiKey,
            email,
          },
        apiKey: prev.apiKey ?? cachedAccess.apiKey,
      }));
    }

    try {
      const merchants = await merchantApi.getMerchants();
      const match = merchants.find(
        (merchant) => merchant.email?.trim().toLowerCase() === emailKey,
      );

      if (!match) return;

      const resolvedApiKey = match.apiKey ?? cachedAccess?.apiKey ?? null;
      if (resolvedApiKey) {
        merchantAccessCacheStorage.writeByEmail(emailKey, {
          merchantId: match.merchantId,
          apiKey: resolvedApiKey,
        });
      }

      persist((prev) => ({
        ...prev,
        merchant: {
          merchantId: match.merchantId,
          apiKey: resolvedApiKey ?? prev.apiKey ?? '',
          email: match.email ?? prev.email ?? email,
          userName: match.userName,
          country: match.country,
        },
        apiKey: resolvedApiKey ?? prev.apiKey,
      }));
    } catch {
      // Non-blocking best effort hydration.
    }
  };

  const logout = () => {
    const next = getDefaultSession();
    setSession(next);
    authSessionStorage.clear();
  };

  const value: AuthContextValue = {
    session,
    isAuthenticated: Boolean(session.token),
    setToken,
    setMerchant,
    hydrateMerchantSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
