import { useEffect, useState } from 'react';
// @mui
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { formatDateTime, formatMzn } from 'src/utils/maputo-time';
// redux
import { useGetEntriesQuery } from 'src/redux/services/entryService';
// types
import { IEntryFilter, IEntryRow } from 'src/types/detailing';
//
import PagedTable, { Column } from '../shared/PagedTable';
import { PaymentStatusLabel, WorkStatusLabel } from '../shared/StatusLabels';

// ----------------------------------------------------------------------

type Props = {
  filter: IEntryFilter;
  hideClient?: boolean;
};

export default function EntriesTable({ filter, hideClient }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);

  const filterKey = JSON.stringify(filter);
  useEffect(() => setPage(0), [filterKey]);

  const { currentData, isFetching } = useGetEntriesQuery({
    ...filter,
    page,
    size,
    sort: 'entryAt,desc',
  });

  const columns: Column[] = [
    { id: 'number', label: 'Entrada' },
    { id: 'date', label: 'Data' },
    ...(hideClient ? [] : [{ id: 'client', label: 'Cliente' }]),
    { id: 'vehicle', label: 'Viatura' },
    { id: 'work', label: 'Trabalho' },
    { id: 'total', label: 'Total', align: 'right' as const },
    { id: 'balance', label: 'Saldo', align: 'right' as const },
    { id: 'payment', label: 'Pagamento' },
  ];

  return (
    <PagedTable<IEntryRow>
      columns={columns}
      rows={currentData?.content ?? []}
      loading={isFetching && !currentData}
      total={currentData?.totalElements ?? 0}
      page={page}
      rowsPerPage={size}
      onPageChange={setPage}
      onRowsPerPageChange={(value) => {
        setSize(value);
        setPage(0);
      }}
      renderRow={(row) => (
        <TableRow
          key={row.id}
          hover
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push(paths.dashboard.entry.detail(row.id))}
        >
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.number}</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.entryAt)}</TableCell>
          {!hideClient && <TableCell>{row.clientName}</TableCell>}
          <TableCell>
            {row.openingBalance ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Saldo de abertura
              </Typography>
            ) : (
              <>
                <Typography variant="body2">{row.vehiclePlate}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {row.vehicleDescription}
                </Typography>
              </>
            )}
          </TableCell>
          <TableCell>
            <WorkStatusLabel status={row.workStatus} />
          </TableCell>
          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
            {formatMzn(row.total)}
          </TableCell>
          <TableCell
            align="right"
            sx={{ whiteSpace: 'nowrap', color: row.balance > 0 ? 'error.main' : 'text.primary' }}
          >
            {formatMzn(row.balance)}
          </TableCell>
          <TableCell>
            <PaymentStatusLabel status={row.paymentStatus} />
          </TableCell>
        </TableRow>
      )}
    />
  );
}
