import { useEffect, useRef, useState } from 'react';
import { useSessionState } from 'src/hooks/use-session-state';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';
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
  /** Guarda pagina e linhas por pagina ao abrir um registo e voltar. */
  persistKey?: string;
  filter: IEntryFilter;
  hideClient?: boolean;
};

type MobileCardProps = {
  row: IEntryRow;
  hideClient?: boolean;
  onOpen: VoidFunction;
};

function EntryMobileCard({ row, hideClient, onOpen }: MobileCardProps) {
  return (
    <Card>
      <CardActionArea onClick={onOpen} aria-label={`Abrir entrada ${row.number}`}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle1" noWrap>
                {row.number}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatDateTime(row.entryAt)}
              </Typography>
            </Box>
            <WorkStatusLabel status={row.workStatus} />
            <Iconify icon="eva:chevron-right-fill" sx={{ mt: 0.5, flexShrink: 0 }} />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={1.25}>
            {!hideClient && (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                  Cliente
                </Typography>
                <Typography variant="body2" noWrap sx={{ minWidth: 0, textAlign: 'right' }}>
                  {row.clientName}
                </Typography>
              </Stack>
            )}

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                Viatura
              </Typography>
              <Box sx={{ minWidth: 0, textAlign: 'right' }}>
                <Typography variant="body2" noWrap>
                  {row.openingBalance ? 'Saldo de abertura' : row.vehiclePlate}
                </Typography>
                {!row.openingBalance && row.vehicleDescription && (
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ display: 'block', color: 'text.secondary' }}
                  >
                    {row.vehicleDescription}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Pagamento
              </Typography>
              <PaymentStatusLabel status={row.paymentStatus} />
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Total
              </Typography>
              <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                {formatMzn(row.total)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Saldo
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  whiteSpace: 'nowrap',
                  color: row.balance > 0 ? 'error.main' : 'text.primary',
                }}
              >
                {formatMzn(row.balance)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function EntriesTable({ filter, hideClient, persistKey }: Props) {
  const router = useRouter();
  const [page, setPage] = useSessionState(persistKey ? `${persistKey}.page` : null, 0);
  const [size, setSize] = useSessionState(persistKey ? `${persistKey}.size` : null, 25);

  const filterKey = JSON.stringify(filter);
  const previousFilter = useRef(filterKey);
  useEffect(() => {
    // Volta a primeira pagina so quando o filtro muda, nao ao regressar a lista.
    if (previousFilter.current !== filterKey) {
      previousFilter.current = filterKey;
      setPage(0);
    }
  }, [filterKey, setPage]);

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
      mobileRenderRow={(row) => (
        <EntryMobileCard
          key={row.id}
          row={row}
          hideClient={hideClient}
          onOpen={() => router.push(paths.dashboard.entry.detail(row.id))}
        />
      )}
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
