import { useEffect, useRef, useState } from 'react';
import { useSessionState } from 'src/hooks/use-session-state';
// @mui
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { formatDate, formatMzn } from 'src/utils/maputo-time';
// redux
import { useGetPaymentsQuery } from 'src/redux/services/paymentService';
// types
import { IPayment, IPaymentFilter, PAYMENT_METHOD_LABELS } from 'src/types/detailing';
//
import PagedTable, { Column } from '../shared/PagedTable';
import MobileCard from '../shared/MobileCard';
import { MovementLabel } from '../shared/StatusLabels';
import PaymentReverseDialog from './PaymentReverseDialog';

// ----------------------------------------------------------------------

type Props = {
  /** Guarda pagina e linhas por pagina ao abrir um registo e voltar. */
  persistKey?: string;
  filter: IPaymentFilter;
  hideClient?: boolean;
};

export default function PaymentsTable({ filter, hideClient, persistKey }: Props) {
  const [page, setPage] = useSessionState(persistKey ? `${persistKey}.page` : null, 0);
  const [size, setSize] = useSessionState(persistKey ? `${persistKey}.size` : null, 25);
  const [toReverse, setToReverse] = useState<IPayment | null>(null);

  const filterKey = JSON.stringify(filter);
  const previousFilter = useRef(filterKey);
  useEffect(() => {
    // Volta a primeira pagina so quando o filtro muda, nao ao regressar a lista.
    if (previousFilter.current !== filterKey) {
      previousFilter.current = filterKey;
      setPage(0);
    }
  }, [filterKey, setPage]);

  const { currentData, isFetching } = useGetPaymentsQuery({
    ...filter,
    page,
    size,
    sort: 'paymentDate,desc',
  });

  const canReverse = hasPermission([Authorities.REVERSE_PAYMENTS]);

  const columns: Column[] = [
    { id: 'number', label: 'Número' },
    { id: 'date', label: 'Data' },
    ...(hideClient ? [] : [{ id: 'client', label: 'Cliente' }]),
    { id: 'method', label: 'Método' },
    { id: 'allocations', label: 'Referência / motivo' },
    { id: 'amount', label: 'Montante', align: 'right' as const },
    { id: 'status', label: 'Estado' },
    { id: 'actions', label: '', align: 'right' as const },
  ];

  return (
    <>
      <PagedTable<IPayment>
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
          <MobileCard
            key={row.id}
            title={row.number}
            subtitle={formatDate(row.paymentDate)}
            status={<MovementLabel kind={row.kind} status={row.status} refund={row.refund} />}
            rows={[
              ...(hideClient ? [] : [{ label: 'Cliente', value: row.clientName }]),
              { label: 'Método', value: PAYMENT_METHOD_LABELS[row.method] },
              ...(row.reference ? [{ label: 'Referência', value: row.reference }] : []),
              ...(row.reason ? [{ label: 'Motivo', value: row.reason }] : []),
              {
                label: 'Montante',
                value: formatMzn(row.amount),
                emphasis: true,
                color: row.amount < 0 ? 'error.dark' : undefined,
              },
            ]}
            actions={
              canReverse && row.kind === 'PAYMENT' && row.status === 'VALID' ? (
                <Button
                  color="error"
                  startIcon={<Iconify icon="solar:undo-left-round-bold-duotone" />}
                  onClick={() => setToReverse(row)}
                  sx={{ minHeight: 44 }}
                >
                  Estornar
                </Button>
              ) : undefined
            }
          />
        )}
        renderRow={(row) => (
          <TableRow key={row.id} hover>
            <TableCell>{row.number}</TableCell>
            <TableCell>{formatDate(row.paymentDate)}</TableCell>
            {!hideClient && <TableCell>{row.clientName}</TableCell>}
            <TableCell>{PAYMENT_METHOD_LABELS[row.method]}</TableCell>
            <TableCell>
              <Typography variant="body2">{row.reference ?? '—'}</Typography>
              {row.reason && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {row.reason}
                </Typography>
              )}
            </TableCell>
            <TableCell
              align="right"
              sx={{ color: row.amount < 0 ? 'error.dark' : 'text.primary', whiteSpace: 'nowrap' }}
            >
              {formatMzn(row.amount)}
            </TableCell>
            <TableCell>
              <MovementLabel kind={row.kind} status={row.status} refund={row.refund} />
            </TableCell>
            <TableCell align="right">
              {canReverse && row.kind === 'PAYMENT' && row.status === 'VALID' && (
                <Tooltip title="Estornar">
                  <IconButton color="error" aria-label="Estornar" onClick={() => setToReverse(row)}>
                    <Iconify icon="solar:undo-left-round-bold-duotone" />
                  </IconButton>
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        )}
      />

      <PaymentReverseDialog payment={toReverse} onClose={() => setToReverse(null)} />
    </>
  );
}
