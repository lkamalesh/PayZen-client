import { Box, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/api/auditApi';
import { queryKeys } from '@/api/queryKeys';
import { DataTable, type DataColumn } from '@/shared/components/data/DataTable';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingState } from '@/shared/components/states/LoadingState';
import { formatDateTime } from '@/shared/utils/format';
import type { AuditLogDto } from '@/types/audit';

export const AuditLogsPage = () => {
  const logsQuery = useQuery({
    queryKey: queryKeys.audit,
    queryFn: auditApi.getAuditLogs,
  });

  if (logsQuery.isLoading) {
    return <LoadingState message="Loading audit events..." />;
  }

  if (logsQuery.isError) {
    return <ErrorState message="Failed to load audit logs." onRetry={logsQuery.refetch} />;
  }

  const rows = logsQuery.data ?? [];

  const columns: DataColumn<AuditLogDto>[] = [
    { key: 'customerId', header: 'Customer ID', render: (row) => row.customerId },
    { key: 'action', header: 'Action', render: (row) => row.action },
    { key: 'timestamp', header: 'Timestamp', render: (row) => formatDateTime(row.timestamp) },
  ];

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Audit Logs
        </Typography>
        <Typography color="text.secondary">Track security-sensitive and user actions.</Typography>
      </Box>
      <DataTable
        columns={columns}
        rows={rows}
        page={0}
        rowsPerPage={rows.length || 10}
        totalCount={rows.length}
        onPageChange={() => undefined}
        onRowsPerPageChange={() => undefined}
        rowKey={(row) => `${row.customerId}-${row.timestamp}`}
        hidePagination
      />
    </Stack>
  );
};
