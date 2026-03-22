import { apiClient } from '@/api/client';
import type {
  LoginRequestDto,
  LoginResponseDto,
  MerchantResponseDto,
  RegisterRequestDto,
} from '@/types/auth';

export const authApi = {
  async register(payload: RegisterRequestDto): Promise<MerchantResponseDto> {
    const { data } = await apiClient.post<MerchantResponseDto>('/api/Auth/Register', payload);
    return data;
  },
  async login(payload: LoginRequestDto): Promise<string> {
    const { data } = await apiClient.post<LoginResponseDto>('/api/Auth/Login', payload);
    const token = data.token ?? data.Token;
    if (!token) {
      throw new Error('Token is missing in auth response');
    }
    return token;
  },
};
