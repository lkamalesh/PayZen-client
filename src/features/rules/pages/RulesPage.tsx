import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/api/queryKeys';
import { ruleApi } from '@/api/ruleApi';
import { RuleFormDialog } from '@/features/rules/components/RuleFormDialog';
import type { RuleFormValues } from '@/features/rules/schemas/ruleSchema';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { DataTable, type DataColumn } from '@/shared/components/data/DataTable';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingState } from '@/shared/components/states/LoadingState';
import type { RuleDto } from '@/types/rule';

export const RulesPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RuleDto | null>(null);

  const rulesQuery = useQuery({
    queryKey: queryKeys.rules,
    queryFn: ruleApi.getRules,
  });

  const upsertMutation = useMutation({
    mutationFn: (payload: RuleFormValues) => {
      if (payload.ruleId) {
        return ruleApi.updateRule(payload);
      }
      return ruleApi.createRule(payload);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.rules });
      const previous = queryClient.getQueryData<RuleDto[]>(queryKeys.rules) ?? [];

      if (payload.ruleId) {
        queryClient.setQueryData<RuleDto[]>(queryKeys.rules, (current = []) =>
          current.map((rule) =>
            rule.ruleId === payload.ruleId
              ? {
                  ...rule,
                  ...payload,
                  ruleId: payload.ruleId,
                }
              : rule,
          ),
        );
      } else {
        const optimisticRule: RuleDto = {
          ...payload,
          ruleId: `temp-${Date.now()}`,
          description: payload.description,
        };
        queryClient.setQueryData<RuleDto[]>(queryKeys.rules, (current = []) => [optimisticRule, ...current]);
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.rules, context.previous);
      }
      showToast('Rule mutation failed', 'error');
    },
    onSuccess: () => {
      showToast('Rule saved successfully', 'success');
      setDialogOpen(false);
      setEditingRule(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rules });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId: string) => ruleApi.deleteRule(ruleId),
    onSuccess: () => {
      showToast('Rule deleted', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.rules });
    },
    onError: () => {
      showToast('Delete failed', 'error');
    },
  });

  if (rulesQuery.isLoading) {
    return <LoadingState message="Loading risk rules..." />;
  }

  if (rulesQuery.isError) {
    return <ErrorState message="Failed to load rules." onRetry={rulesQuery.refetch} />;
  }

  const rows = rulesQuery.data ?? [];
  const pagedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columns: DataColumn<RuleDto>[] = [
    { key: 'condition', header: 'Condition', render: (row) => row.condition },
    { key: 'value', header: 'Value', render: (row) => row.value },
    { key: 'scoreImpact', header: 'Impact', render: (row) => row.scoreImpact },
    {
      key: 'isActive',
      header: 'State',
      render: (row) => <Chip color={row.isActive ? 'success' : 'default'} label={row.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              setEditingRule(row);
              setDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setDeleteTarget(row)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" gutterBottom>
            Risk Rules
          </Typography>
          <Typography color="text.secondary">Manage real-time fraud scoring rules.</Typography>
        </div>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => {
            setEditingRule(null);
            setDialogOpen(true);
          }}
        >
          New Rule
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={pagedRows}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={rows.length}
        onPageChange={setPage}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size);
          setPage(0);
        }}
        rowKey={(row) => row.ruleId}
      />

      <RuleFormDialog
        open={dialogOpen}
        editingRule={editingRule}
        onClose={() => {
          setDialogOpen(false);
          setEditingRule(null);
        }}
        onSubmit={(values) => upsertMutation.mutate(values)}
        isSubmitting={upsertMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Rule"
        description="This action cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.ruleId);
          }
        }}
      />
    </Stack>
  );
};
