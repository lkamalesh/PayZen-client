import { Box, Chip, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { merchantApi } from '@/api/merchantApi';
import { queryKeys } from '@/api/queryKeys';
import { DataTable, type DataColumn } from '@/shared/components/data/DataTable';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingState } from '@/shared/components/states/LoadingState';
import { formatDateTime } from '@/shared/utils/format';
import type { MerchantDto } from '@/types/merchant';

export const MerchantsPage = () => {
  const merchantsQuery = useQuery({
    queryKey: queryKeys.merchants,
    queryFn: merchantApi.getMerchants,
  });

  if (merchantsQuery.isLoading) {
    return <LoadingState message="Loading merchants..." />;
  }

  if (merchantsQuery.isError) {
    return <ErrorState message="Failed to load merchants." onRetry={merchantsQuery.refetch} />;
  }

  const rows = merchantsQuery.data ?? [];

  const columns: DataColumn<MerchantDto>[] = [
    { key: 'merchantId', header: 'Merchant ID', render: (row) => row.merchantId },
    { key: 'userName', header: 'User Name', render: (row) => row.userName ?? 'N/A' },
    { key: 'country', header: 'Country', render: (row) => row.country ?? 'N/A' },
    { key: 'email', header: 'Email', render: (row) => row.email ?? 'N/A' },
    {
      key: 'isActive',
      header: 'State',
      render: (row) => <Chip label={row.isActive ? 'Active' : 'Unknown'} color={row.isActive ? 'success' : 'default'} />,
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Merchants
        </Typography>
        <Typography color="text.secondary">Merchant directory and account posture view.</Typography>
      </Box>
      <DataTable
        columns={columns}
        rows={rows}
        page={0}
        rowsPerPage={rows.length || 10}
        totalCount={rows.length}
        onPageChange={() => undefined}
        onRowsPerPageChange={() => undefined}
        rowKey={(row) => row.merchantId}
        hidePagination
      />
    </Stack>
  );
};
