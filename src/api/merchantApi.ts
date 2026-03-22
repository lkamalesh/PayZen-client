import { apiClient } from '@/api/client';
import type { MerchantDto } from '@/types/merchant';

export const merchantApi = {
  async getMerchants(): Promise<MerchantDto[]> {
    const { data } = await apiClient.get<MerchantDto[]>('/api/Merchant/GetAll');
    return data;
  },
};
