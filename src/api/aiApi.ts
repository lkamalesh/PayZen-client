import { apiClient } from '@/api/client';

export const aiApi = {
  async explainRisk(transactionId: string): Promise<string> {
    const { data } = await apiClient.get<string>(`/api/AI/${transactionId}`, {
      responseType: 'text',
    });
    return data;
  },
};
