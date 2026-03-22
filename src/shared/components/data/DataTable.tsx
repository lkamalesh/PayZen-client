import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import type { ReactNode } from 'react';
import { EmptyState } from '@/shared/components/states/EmptyState';

export interface DataColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (size: number) => void;
  rowKey: (row: T) => string;
  emptyTitle?: string;
  hidePagination?: boolean;
}

export const DataTable = <T,>({
  columns,
  rows,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowKey,
  emptyTitle = 'No records found',
  hidePagination = false,
}: DataTableProps<T>) => {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description="Adjust filters or create new records." />;
  }

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align ?? 'left'}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)} hover>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align ?? 'left'}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!hidePagination ? (
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_event, nextPage) => onPageChange(nextPage)}
          onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
        />
      ) : null}
    </Paper>
  );
};
