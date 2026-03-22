import { z } from 'zod';

export const ruleConditionOptions = [
  'AmountGreaterThan',
  'CurrencyIs',
  'PaymentMethodIs',
  'CustomerCountryIs',
] as const;

export const ruleSchema = z.object({
  ruleId: z.string().optional(),
  // Accept backend-provided condition values to avoid blocking edits when API introduces new enum variants.
  condition: z.string().trim().min(1, 'Condition is required').max(128),
  value: z.string().min(1, 'Value is required').max(128),
  scoreImpact: z.coerce.number().int().min(-100).max(100),
  description: z.string().max(255).optional(),
  isActive: z.boolean(),
});

export type RuleFormInput = z.input<typeof ruleSchema>;
export type RuleFormValues = z.output<typeof ruleSchema>;
