import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { aiApi } from '@/api/aiApi';
import { queryKeys } from '@/api/queryKeys';
import { transactionApi } from '@/api/transactionApi';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AiExplanationDrawer } from '@/features/transactions/components/AiExplanationDrawer';
import { useToast } from '@/hooks/useToast';
import { DataTable, type DataColumn } from '@/shared/components/data/DataTable';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingState } from '@/shared/components/states/LoadingState';
import { normalizePaymentMethod, normalizeStatus } from '@/shared/utils/enum';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';
import type { TransactionDto } from '@/types/transaction';

const statusFilters = ['All', 'Pending', 'Approved', 'Declined', 'Flagged'];

export const TransactionsPage = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const merchantId = session.merchant?.merchantId;
  const isOpsRole = session.role === 'Analyst';

  const transactionsQuery = useQuery({
    queryKey: isOpsRole
      ? ['transactions', 'ops-all', session.role]
      : merchantId
        ? queryKeys.transactions.byMerchant(merchantId)
        : ['transactions', 'empty'],
    queryFn: () => (isOpsRole ? transactionApi.getAll() : transactionApi.getByMerchant(merchantId ?? '')),
    enabled: isOpsRole || Boolean(merchantId),
  });

  const explainMutation = useMutation({
    mutationFn: aiApi.explainRisk,
    onSuccess: (data) => {
      setExplanation(data);
    },
    onError: () => {
      showToast('Failed to fetch AI explanation', 'error');
      setExplanation('AI explanation could not be loaded.');
    },
  });

  const filteredTransactions = useMemo(() => {
    const source = transactionsQuery.data ?? [];

    return source.filter((tx) => {
      const matchesSearch =
        tx.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        tx.customerId.toLowerCase().includes(search.toLowerCase()) ||
        tx.currency.toLowerCase().includes(search.toLowerCase());

      const normalizedStatus = normalizeStatus(tx.status);
      const matchesStatus = statusFilter === 'All' || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactionsQuery.data, search, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  const columns: DataColumn<TransactionDto>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (row) => row.transactionId,
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (row) => row.customerId,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => formatCurrency(row.amount, row.currency),
    },
    {
      key: 'method',
      header: 'Method',
      render: (row) => normalizePaymentMethod(row.paymentMethod),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => normalizeStatus(row.status),
    },
    {
      key: 'riskScore',
      header: 'Risk',
      render: (row) => row.riskScore,
    },
    {
      key: 'processedAt',
      header: 'Processed At',
      render: (row) => formatDateTime(row.processedAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const status = normalizeStatus(row.status).toLowerCase();
        const canExplain = status === 'declined' || status === 'flagged';

        if (!canExplain) {
          return '-';
        }

        return (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSelectedTransactionId(row.transactionId);
              setExplanation(null);
              setDrawerOpen(true);
              explainMutation.mutate(row.transactionId);
            }}
          >
            Explain Risk
          </Button>
        );
      },
    },
  ];

  if (transactionsQuery.isLoading) {
    return <LoadingState message="Loading transactions..." />;
  }

  if (transactionsQuery.isError) {
    return <ErrorState message="Failed to load transactions." onRetry={transactionsQuery.refetch} />;
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Transactions Monitoring
        </Typography>
        <Typography color="text.secondary">
          Search and filter transactions, then request AI-generated risk explanations per row.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          value={search}
          label="Search by transaction, customer, currency"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          value={statusFilter}
          label="Status"
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 220 }}
        >
          {statusFilters.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataTable
        columns={columns}
        rows={pagedRows}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredTransactions.length}
        onPageChange={setPage}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size);
          setPage(0);
        }}
        rowKey={(row) => row.transactionId}
      />

      <AiExplanationDrawer
        open={drawerOpen}
        transactionId={selectedTransactionId}
        explanation={explanation}
        loading={explainMutation.isPending}
        onClose={() => setDrawerOpen(false)}
      />
    </Stack>
  );
};
