export interface RegisterRequestDto {
  userName: string;
  country: string;
  email: string;
  password: string;
}

export interface MerchantResponseDto {
  merchantId: string;
  apiKey: string;
  userName?: string;
  country?: string;
  email?: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token?: string;
  Token?: string;
}

export type UserRole = 'Merchant' | 'Analyst' | 'Unknown';

export interface AuthSession {
  token: string | null;
  merchant: MerchantResponseDto | null;
  apiKey: string | null;
  email: string | null;
  role: UserRole;
}
