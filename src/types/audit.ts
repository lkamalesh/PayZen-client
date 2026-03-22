export interface AuditLogDto {
  customerId: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
}
