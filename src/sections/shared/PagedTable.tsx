import { ReactNode } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
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

type Props<T> = {
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
}: Props<T>) {
  return (
    <Card>
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
                ? [...Array(5)].map((_, index) => <TableSkeleton key={index} sx={{ height: 40 }} />)
                : rows.map(renderRow)}
              {!loading && rows.length === 0 && <TableNoData notFound />}
            </TableBody>
            {footer}
          </Table>
        </Scrollbar>
      </TableContainer>
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
      />
    </Card>
  );
}
