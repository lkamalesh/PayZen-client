import { apiClient } from '@/api/client';
import type { CreatePaymentRequestDto, PaymentResponseDto } from '@/types/payment';

export const paymentApi = {
  async createPayment(payload: CreatePaymentRequestDto): Promise<PaymentResponseDto> {
    const idempotencyKey = crypto.randomUUID();
    const { data } = await apiClient.post<PaymentResponseDto>('/api/Payment', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return data;
  },
};
