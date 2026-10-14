import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { getApiErrorMessage } from 'src/utils/axios';
import { formatDate, formatDateTime, formatMzn } from 'src/utils/maputo-time';
// redux
import {
  useCancelEntryMutation,
  useChangeEntryStatusMutation,
  useGetEntryHistoryQuery,
  useGetEntryQuery,
} from 'src/redux/services/entryService';
// types
import {
  PAYMENT_METHOD_LABELS,
  PRICING_TYPE_LABELS,
  VEHICLE_CATEGORY_LABELS,
  WORK_FLOW,
  WORK_STATUS_LABELS,
  WorkStatus,
} from 'src/types/detailing';
//
import HeaderPrimaryAction from '../shared/HeaderPrimaryAction';
import PaymentFormDialog from '../payment/PaymentFormDialog';
import HistoryList from '../shared/HistoryList';
import ReasonDialog from '../shared/ReasonDialog';
import { PaymentStatusLabel, WorkStatusLabel } from '../shared/StatusLabels';

// ----------------------------------------------------------------------

const NEXT_ACTION: Partial<Record<WorkStatus, string>> = {
  IN_PROGRESS: 'Iniciar trabalho',
  COMPLETED: 'Concluir',
  DELIVERED: 'Entregar',
};

export default function EntryDetailView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const entryId = Number(id);

  const { currentData: entry, isLoading } = useGetEntryQuery(entryId);
  const { currentData: history = [] } = useGetEntryHistoryQuery(entryId);
  const [changeStatus, { isLoading: changing }] = useChangeEntryStatusMutation();
  const [cancelEntry, { isLoading: cancelling }] = useCancelEntryMutation();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [authorizeOpen, setAuthorizeOpen] = useState(false);

  usePageHeader({
    title: entry ? `Entrada ${entry.number}` : 'Entrada',
    primaryAction: (
      <HeaderPrimaryAction
        label="Entradas"
        icon="eva:arrow-back-fill"
        variant="soft"
        color="secondary"
        onClick={() => router.push(paths.dashboard.entry.list)}
      />
    ),
  });

  if (isLoading || !entry) {
    return <LoadingScreen />;
  }

  const cancelled = entry.workStatus === 'CANCELLED';
  const delivered = entry.workStatus === 'DELIVERED';
  const canManageDelivered = hasPermission([Authorities.MANAGE_DELIVERED]);
  const canEdit =
    !cancelled &&
    !entry.openingBalance &&
    hasPermission([Authorities.UPDATE_ENTRIES]) &&
    (!delivered || canManageDelivered);
  const canChangeStatus = !cancelled && hasPermission([Authorities.UPDATE_ENTRIES]);
  const nextStatus = WORK_FLOW[WORK_FLOW.indexOf(entry.workStatus) + 1];
  const needsCreditAuthorization = entry.balance > 0 && !entry.clientCreditAllowed;
  const canAuthorizeCredit = hasPermission([Authorities.AUTHORIZE_CREDIT]);

  const updateStatus = async (workStatus: WorkStatus, reason?: string) => {
    try {
      await changeStatus({ id: entry.id, workStatus, reason }).unwrap();
      enqueueSnackbar(`Estado: ${WORK_STATUS_LABELS[workStatus]}.`);
      setAuthorizeOpen(false);
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível alterar o estado.'), {
        variant: 'error',
      });
    }
  };

  const handleNext = () => {
    if (nextStatus === 'DELIVERED' && needsCreditAuthorization) {
      setAuthorizeOpen(true);
      return;
    }
    updateStatus(nextStatus);
  };

  const handleCancel = async (reason: string) => {
    try {
      await cancelEntry({ id: entry.id, reason }).unwrap();
      enqueueSnackbar('Entrada cancelada.');
      setCancelOpen(false);
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível cancelar.'), {
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Entrada {entry.number}</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack spacing={3}>
          {cancelled && (
            <Alert severity="error">
              Entrada cancelada por {entry.cancelledBy} em {formatDateTime(entry.cancelledAt)}.
              Motivo: {entry.cancelReason}
            </Alert>
          )}
          {entry.creditAuthorizedBy && (
            <Alert severity="warning">
              Entrega com saldo pendente autorizada por {entry.creditAuthorizedBy}. Motivo:{' '}
              {entry.creditReason}
            </Alert>
          )}

          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid xs={12} md={7}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="h5">{entry.number}</Typography>
                      <WorkStatusLabel status={entry.workStatus} />
                      <PaymentStatusLabel status={entry.paymentStatus} />
                    </Stack>
                    <Link
                      component={RouterLink}
                      href={paths.dashboard.client.detail(entry.clientId)}
                      variant="subtitle1"
                    >
                      {entry.clientName}
                    </Link>
                    {entry.openingBalance ? (
                      <Typography variant="body2">Saldo de abertura</Typography>
                    ) : (
                      <Typography variant="body2">
                        {entry.vehiclePlate} · {entry.vehicleDescription}
                        {entry.vehicleCategory
                          ? ` · ${VEHICLE_CATEGORY_LABELS[entry.vehicleCategory]}`
                          : ''}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {formatDateTime(entry.entryAt)} · responsável {entry.responsible}
                      {entry.deliveredAt
                        ? ` · entregue em ${formatDateTime(entry.deliveredAt)}`
                        : ''}
                    </Typography>
                    {entry.notes && <Typography variant="body2">{entry.notes}</Typography>}
                  </Stack>
                </Grid>
                <Grid xs={12} md={5}>
                  <Stack spacing={1} alignItems={{ md: 'flex-end' }}>
                    <Typography variant="body2">Total: {formatMzn(entry.total)}</Typography>
                    <Typography variant="body2">Pago: {formatMzn(entry.paid)}</Typography>
                    <Typography
                      variant="h5"
                      sx={{ color: entry.balance > 0 ? 'error.main' : 'success.main' }}
                    >
                      Saldo: {formatMzn(entry.balance)}
                    </Typography>
                    {!entry.clientCreditAllowed && entry.balance > 0 && (
                      <Typography variant="caption" sx={{ color: 'warning.main' }}>
                        Cliente sem conta corrente: a entrega com saldo exige autorização do gestor.
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                {canChangeStatus && nextStatus && !entry.openingBalance && (
                  <Button
                    variant="contained"
                    disabled={
                      changing ||
                      (nextStatus === 'DELIVERED' &&
                        needsCreditAuthorization &&
                        !canAuthorizeCredit)
                    }
                    onClick={handleNext}
                    startIcon={<Iconify icon="solar:arrow-right-bold-duotone" />}
                  >
                    {NEXT_ACTION[nextStatus]}
                  </Button>
                )}
                {entry.balance > 0 && hasPermission([Authorities.CREATE_PAYMENTS]) && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Iconify icon="solar:wallet-money-bold-duotone" />}
                    onClick={() => setPaymentOpen(true)}
                  >
                    Receber pagamento
                  </Button>
                )}
                {canEdit && (
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    onClick={() => router.push(paths.dashboard.entry.edit(entry.id))}
                  >
                    Editar
                  </Button>
                )}
                {delivered && canManageDelivered && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    disabled={changing}
                    onClick={() => updateStatus('COMPLETED')}
                  >
                    Anular entrega
                  </Button>
                )}
                {!cancelled && hasPermission([Authorities.CANCEL_ENTRIES]) && (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={entry.paid !== 0}
                    title={entry.paid !== 0 ? 'Estorne os pagamentos antes de cancelar' : undefined}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancelar entrada
                  </Button>
                )}
              </Stack>
              {nextStatus === 'DELIVERED' &&
                needsCreditAuthorization &&
                !canAuthorizeCredit &&
                canChangeStatus && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Para entregar, registe o pagamento ou peça ao gestor que autorize a entrega com
                    saldo pendente.
                  </Alert>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Serviços" />
            <Scrollbar>
              <Table size="small" sx={{ minWidth: 640, mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Qtd / horas</TableCell>
                    <TableCell align="right">Preço</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entry.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <Typography variant="body2">{line.serviceName}</Typography>
                        {line.adjustReason && (
                          <Typography variant="caption" sx={{ color: 'warning.main' }}>
                            Ajuste (catálogo {formatMzn(line.catalogPrice)}): {line.adjustReason}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{PRICING_TYPE_LABELS[line.pricingType]}</TableCell>
                      <TableCell align="right">{line.quantity}</TableCell>
                      <TableCell align="right">{formatMzn(line.unitPrice)}</TableCell>
                      <TableCell align="right">{formatMzn(line.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <Typography variant="subtitle2">Total</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">{formatMzn(entry.total)}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scrollbar>
          </Card>

          <Card>
            <CardHeader title="Pagamentos afectados" />
            <Scrollbar>
              <Table size="small" sx={{ minWidth: 560, mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Recibo</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entry.allocations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Sem pagamentos.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {entry.allocations.map((allocation, index) => (
                    <TableRow key={`${allocation.paymentId}-${index}`}>
                      <TableCell>
                        {allocation.paymentNumber}
                        {allocation.kind === 'REVERSAL' ? ' (estorno)' : ''}
                      </TableCell>
                      <TableCell>{formatDate(allocation.paymentDate)}</TableCell>
                      <TableCell>{PAYMENT_METHOD_LABELS[allocation.method]}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: allocation.amount < 0 ? 'error.main' : 'text.primary' }}
                      >
                        {formatMzn(allocation.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </Card>

          <HistoryList items={history} />
        </Stack>
      </Container>

      <PaymentFormDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        client={{ id: entry.clientId, name: entry.clientName }}
        entryId={entry.id}
      />

      <ReasonDialog
        open={cancelOpen}
        title="Cancelar entrada"
        description="A entrada deixa de contar nos totais, mas o registo é preservado."
        confirmLabel="Cancelar entrada"
        confirmColor="error"
        loading={cancelling}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />

      <ReasonDialog
        open={authorizeOpen}
        title="Autorizar entrega com saldo pendente"
        description={
          <Alert severity="warning">
            O cliente não tem conta corrente e a entrada tem {formatMzn(entry.balance)} por pagar. A
            autorização fica registada com o seu nome e o motivo.
          </Alert>
        }
        confirmLabel="Autorizar e entregar"
        confirmColor="warning"
        loading={changing}
        onClose={() => setAuthorizeOpen(false)}
        onConfirm={(reason) => updateStatus('DELIVERED', reason)}
      />
    </>
  );
}
