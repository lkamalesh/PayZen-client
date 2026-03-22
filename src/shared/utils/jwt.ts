import type { UserRole } from '@/types/auth';

const ROLE_CLAIM_KEYS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
] as const;

const MERCHANT_ID_CLAIM_KEYS = [
  'merchantid',
  'merchant_id',
  'merchant-id',
  'nameidentifier',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  'http://schemas.paymentai/claims/merchantid',
] as const;

const API_KEY_CLAIM_KEYS = [
  'apikey',
  'api_key',
  'api-key',
  'http://schemas.paymentai/claims/apikey',
] as const;

interface DecodedPayload {
  raw: Record<string, unknown>;
  normalized: Record<string, unknown>;
}

interface MerchantAccessFromToken {
  merchantId: string | null;
  apiKey: string | null;
}

const stripBearerPrefix = (token: string): string => token.replace(/^Bearer\s+/i, '').trim();
const normalizeClaimKey = (key: string): string => key.trim().toLowerCase();

const decodePayload = (token: string): DecodedPayload | null => {
  const cleanToken = stripBearerPrefix(token);
  const parts = cleanToken.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    const normalized = Object.entries(parsed).reduce<Record<string, unknown>>((acc, [key, value]) => {
      acc[normalizeClaimKey(key)] = value;
      return acc;
    }, {});

    return { raw: parsed, normalized };
  } catch {
    return null;
  }
};

const findClaimValue = (payload: DecodedPayload, keys: readonly string[]): unknown => {
  for (const key of keys) {
    if (key in payload.raw) {
      return payload.raw[key];
    }
    const normalized = normalizeClaimKey(key);
    if (normalized in payload.normalized) {
      return payload.normalized[normalized];
    }
  }

  return undefined;
};

const normalizeRole = (value: string): UserRole => {
  const lowered = value.trim().toLowerCase();
  if (lowered === 'merchant') return 'Merchant';
  if (lowered === 'analyst') return 'Analyst';
  return 'Unknown';
};

export const extractRoleFromToken = (token: string | null): UserRole => {
  if (!token) return 'Unknown';

  const payload = decodePayload(token);
  if (!payload) {
    return 'Unknown';
  }

  const roleValue = findClaimValue(payload, ROLE_CLAIM_KEYS);
  if (typeof roleValue === 'string') {
    return normalizeRole(roleValue);
  }
  if (Array.isArray(roleValue)) {
    const firstString = roleValue.find((item) => typeof item === 'string');
    if (typeof firstString === 'string') {
      return normalizeRole(firstString);
    }
  }

  return 'Unknown';
};

export const extractMerchantAccessFromToken = (token: string | null): MerchantAccessFromToken => {
  if (!token) {
    return { merchantId: null, apiKey: null };
  }

  const payload = decodePayload(token);
  if (!payload) {
    return { merchantId: null, apiKey: null };
  }

  const merchantIdValue = findClaimValue(payload, MERCHANT_ID_CLAIM_KEYS);
  const apiKeyValue = findClaimValue(payload, API_KEY_CLAIM_KEYS);

  return {
    merchantId: typeof merchantIdValue === 'string' ? merchantIdValue : null,
    apiKey: typeof apiKeyValue === 'string' ? apiKeyValue : null,
  };
};
