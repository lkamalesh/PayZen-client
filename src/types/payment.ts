export interface CreatePaymentRequestDto {
  merchantId: string;
  customerId: string;
  amount: number;
  country: string;
  currency: string;
  paymentMethod: number;
}

export interface PaymentResponseDto {
  transactionId: string;
  status: string | number;
  riskScore: number;
  message: string;
  processedAt: string;
}
