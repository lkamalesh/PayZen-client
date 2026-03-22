export interface TransactionDto {
  transactionId: string;
  merchantId: string;
  customerId: string;
  amount: number;
  country: string;
  currency: string;
  paymentMethod: string | number;
  status: string | number;
  riskScore: number;
  createdAt?: string;
  processedAt?: string;
}
