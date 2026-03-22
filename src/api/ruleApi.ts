import { apiClient } from '@/api/client';
import type { RuleDto, UpsertRuleDto } from '@/types/rule';

export const ruleApi = {
  async getRules(): Promise<RuleDto[]> {
    const { data } = await apiClient.get<RuleDto[]>('/api/Rule/GetAll');
    return data;
  },
  async createRule(payload: UpsertRuleDto): Promise<RuleDto> {
    const { data } = await apiClient.post<RuleDto>('/api/Rule/Create', payload);
    return data;
  },
  async updateRule(payload: UpsertRuleDto): Promise<RuleDto> {
    const { data } = await apiClient.put<RuleDto>('/api/Rule/Update', payload);
    return data;
  },
  async deleteRule(ruleId: string): Promise<void> {
    await apiClient.delete('/api/Rule/Delete', { data: { ruleId } });
  },
};
