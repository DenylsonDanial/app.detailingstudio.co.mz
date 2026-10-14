import { ReactNode } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
// components
import Scrollbar from 'src/components/scrollbar';
import { TableNoData, TableSkeleton } from 'src/components/table';

// ----------------------------------------------------------------------

export type Column = {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: number;
};

export type PagedTableProps<T> = {
  columns: Column[];
  rows: T[];
  /** Devolve a <TableRow> completa de cada linha. */
  renderRow: (row: T) => ReactNode;
  loading?: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (size: number) => void;
  minWidth?: number;
  footer?: ReactNode;
  mobileRenderRow?: (row: T) => ReactNode;
  mobileBreakpoint?: 'sm' | 'md';
};

export default function PagedTable<T>({
  columns,
  rows,
  renderRow,
  loading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  minWidth = 800,
  footer,
  mobileRenderRow,
  mobileBreakpoint = 'sm',
}: PagedTableProps<T>) {
  const pagination = (
    <TablePagination
      component="div"
      count={total}
      page={total === 0 ? 0 : page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[10, 25, 50, 100]}
      labelRowsPerPage="Linhas por página"
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      onPageChange={(_event, value) => onPageChange(value)}
      onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
      sx={{
        minHeight: 52,
        '& .MuiTablePagination-toolbar': {
          minHeight: 52,
          px: { xs: 1, sm: 2 },
        },
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': {
          display: { xs: 'none', [mobileBreakpoint]: 'block' },
        },
        '& .MuiTablePagination-displayedRows': {
          ml: { xs: 'auto', [mobileBreakpoint]: 0 },
        },
        '& .MuiTablePagination-actions': {
          ml: { xs: 0.5, sm: 2.5 },
        },
        '& .MuiIconButton-root': {
          width: 44,
          height: 44,
        },
      }}
    />
  );

  return (
    <>
      {mobileRenderRow && (
        <Box sx={{ display: { xs: 'block', [mobileBreakpoint]: 'none' } }}>
          <Stack spacing={1.5}>
            {loading
              ? [...Array(3)].map((_, index) => (
                  <Card key={index} sx={{ p: 2 }}>
                    <Skeleton variant="text" width="55%" height={28} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="rounded" height={36} sx={{ mt: 1 }} />
                  </Card>
                ))
              : rows.map(mobileRenderRow)}

            {!loading && rows.length === 0 && (
              <Card sx={{ py: 6, px: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1">Sem registos</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  Não foram encontrados resultados para os filtros seleccionados.
                </Typography>
              </Card>
            )}

            <Card>{pagination}</Card>
          </Stack>
        </Box>
      )}

      <Card
        sx={{ display: mobileRenderRow ? { xs: 'none', [mobileBreakpoint]: 'block' } : 'block' }}
      >
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="small" sx={{ minWidth }}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align ?? 'left'}
                      sx={{ width: column.width, whiteSpace: 'nowrap' }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? [...Array(5)].map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 40 }} />
                    ))
                  : rows.map(renderRow)}
                {!loading && rows.length === 0 && <TableNoData notFound />}
              </TableBody>
              {footer}
            </Table>
          </Scrollbar>
        </TableContainer>
        {pagination}
      </Card>
    </>
  );
}
