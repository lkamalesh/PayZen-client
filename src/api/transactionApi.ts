import { apiClient } from '@/api/client';
import type { TransactionDto } from '@/types/transaction';

export const transactionApi = {
  async getAll(): Promise<TransactionDto[]> {
    const { data } = await apiClient.get<TransactionDto[]>('/api/Transaction/GetAll');
    return data;
  },
  async getByMerchant(merchantId: string): Promise<TransactionDto[]> {
    const { data } = await apiClient.get<TransactionDto[]>(`/api/Transaction/${merchantId}`);
    return data;
  },
  async getRecentByCustomer(customerId: string, limit: number): Promise<TransactionDto[]> {
    const { data } = await apiClient.get<TransactionDto[]>(
      `/api/Transaction/GetRecentTransactions/${customerId}/${limit}`,
    );
    return data;
  },
  async getFlagged(): Promise<TransactionDto[]> {
    const { data } = await apiClient.get<TransactionDto[]>('/api/Transaction/status/Flagged');
    return data;
  },
  async getByStatus(status: string): Promise<TransactionDto[]> {
    const { data } = await apiClient.get<TransactionDto[]>(`/api/Transaction/status/${status}`);
    return data;
  },
};
