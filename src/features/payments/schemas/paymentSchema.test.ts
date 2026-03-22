import { describe, expect, it } from 'vitest';
import { paymentSchema } from '@/features/payments/schemas/paymentSchema';

describe('paymentSchema', () => {
  it('accepts valid payload', () => {
    const result = paymentSchema.safeParse({
      merchantId: '550e8400-e29b-41d4-a716-446655440000',
      customerId: 'cust-1',
      amount: 250.5,
      country: 'US',
      currency: 'usd',
      paymentMethod: 1,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('USD');
    }
  });

  it('rejects zero amount', () => {
    const result = paymentSchema.safeParse({
      merchantId: '550e8400-e29b-41d4-a716-446655440000',
      customerId: 'cust-1',
      amount: 0,
      country: 'US',
      currency: 'USD',
      paymentMethod: 1,
    });

    expect(result.success).toBe(false);
  });
});
