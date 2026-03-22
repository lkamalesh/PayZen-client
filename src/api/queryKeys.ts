export const queryKeys = {
  transactions: {
    byMerchant: (merchantId: string) => ['transactions', 'merchant', merchantId] as const,
    flagged: ['transactions', 'flagged'] as const,
    byStatus: (status: string) => ['transactions', 'status', status] as const,
    recentByCustomer: (customerId: string, limit: number) =>
      ['transactions', 'recent', customerId, limit] as const,
  },
  rules: ['rules'] as const,
  audit: ['audit'] as const,
  merchants: ['merchants'] as const,
};
