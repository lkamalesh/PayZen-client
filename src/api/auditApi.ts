import { apiClient } from '@/api/client';
import type { AuditLogDto } from '@/types/audit';

export const auditApi = {
  async getAuditLogs(): Promise<AuditLogDto[]> {
    const { data } = await apiClient.get<AuditLogDto[]>('/api/Audit/GetAll');
    return data;
  },
};
