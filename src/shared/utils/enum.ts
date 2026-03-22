const STATUS_MAP: Record<number, string> = {
  0: 'Pending',
  1: 'Approved',
  2: 'Declined',
  3: 'Flagged',
};

const PAYMENT_METHOD_MAP: Record<number, string> = {
  0: 'CreditCard',
  1: 'DebitCard',
  2: 'BankTransfer',
  3: 'PayPal',
  4: 'Crypto',
  5: 'WireTransfer',
};

export function normalizeStatus(value: string | number): string {
  if (typeof value === 'string') return value;
  return STATUS_MAP[value] ?? String(value);
}

export function normalizePaymentMethod(value: string | number): string {
  if (typeof value === 'string') return value;
  return PAYMENT_METHOD_MAP[value] ?? String(value);
}
