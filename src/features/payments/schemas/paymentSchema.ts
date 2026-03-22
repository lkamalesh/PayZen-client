import { z } from 'zod';

export const paymentSchema = z.object({
  merchantId: z.uuid('Merchant ID must be a valid GUID'),
  customerId: z.string().min(1, 'Customer ID is required').max(64),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  country: z.string().min(2, 'Country is required').max(64),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters')
    .transform((value) => value.toUpperCase()),
  paymentMethod: z.coerce.number().int().min(0),
});

export type PaymentFormInput = z.input<typeof paymentSchema>;
export type PaymentFormValues = z.output<typeof paymentSchema>;
