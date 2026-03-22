import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ruleConditionOptions,
  ruleSchema,
  type RuleFormInput,
  type RuleFormValues,
} from '@/features/rules/schemas/ruleSchema';
import type { RuleDto } from '@/types/rule';

interface RuleFormDialogProps {
  open: boolean;
  editingRule: RuleDto | null;
  onClose: () => void;
  onSubmit: (values: RuleFormValues) => void;
  isSubmitting: boolean;
}

const defaultValues: RuleFormInput = {
  condition: 'AmountGreaterThan',
  value: '',
  scoreImpact: 10,
  description: '',
  isActive: true,
};

export const RuleFormDialog = ({
  open,
  editingRule,
  onClose,
  onSubmit,
  isSubmitting,
}: RuleFormDialogProps) => {
  const conditionOptions =
    editingRule && !ruleConditionOptions.includes(editingRule.condition as (typeof ruleConditionOptions)[number])
      ? [editingRule.condition, ...ruleConditionOptions]
      : ruleConditionOptions;

  const form = useForm<RuleFormInput, unknown, RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingRule) {
      form.reset({
        ruleId: editingRule.ruleId,
        condition: editingRule.condition,
        value: editingRule.value,
        scoreImpact: editingRule.scoreImpact,
        description: editingRule.description ?? '',
        isActive: editingRule.isActive,
      });
      return;
    }

    form.reset(defaultValues);
  }, [editingRule, form, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingRule ? 'Edit Rule' : 'Create Rule'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            select
            label="Condition"
            {...form.register('condition')}
            error={Boolean(form.formState.errors.condition)}
            helperText={form.formState.errors.condition?.message}
          >
            {conditionOptions.map((condition) => (
              <MenuItem key={condition} value={condition}>
                {condition}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Value"
            {...form.register('value')}
            error={Boolean(form.formState.errors.value)}
            helperText={form.formState.errors.value?.message}
          />
          <TextField
            label="Score Impact"
            type="number"
            {...form.register('scoreImpact')}
            error={Boolean(form.formState.errors.scoreImpact)}
            helperText={form.formState.errors.scoreImpact?.message}
          />
          <TextField
            label="Description"
            multiline
            minRows={2}
            {...form.register('description')}
            error={Boolean(form.formState.errors.description)}
            helperText={form.formState.errors.description?.message}
          />
          <Controller
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(_event, checked) => field.onChange(checked)}
                  />
                }
                label="Active"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Rule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
