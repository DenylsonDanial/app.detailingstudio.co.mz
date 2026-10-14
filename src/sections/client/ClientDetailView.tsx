import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { getApiErrorMessage } from 'src/utils/axios';
import { formatMzn } from 'src/utils/maputo-time';
// redux
import {
  useGetClientHistoryQuery,
  useGetClientQuery,
  useSetClientStatusMutation,
  useUpdateCreditMutation,
} from 'src/redux/services/clientService';
import { useSetVehicleStatusMutation } from 'src/redux/services/vehicleService';
// types
import { CLIENT_TYPE_LABELS, IVehicle } from 'src/types/detailing';
//
import HeaderPrimaryAction from '../shared/HeaderPrimaryAction';
import EntriesTable from '../entry/EntriesTable';
import PaymentFormDialog from '../payment/PaymentFormDialog';
import PaymentsTable from '../payment/PaymentsTable';
import HistoryList from '../shared/HistoryList';
import ReasonDialog from '../shared/ReasonDialog';
import ClientFormDialog from './ClientFormDialog';
import OpeningBalanceDialog from './OpeningBalanceDialog';
import ReassignVehicleDialog from './ReassignVehicleDialog';
import StatementPanel from './StatementPanel';
import VehicleFormDialog from './VehicleFormDialog';

// ----------------------------------------------------------------------

type TabValue = 'vehicles' | 'entries' | 'payments' | 'statement' | 'history';

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ClientDetailView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const clientId = Number(id);

  const { currentData: client, isLoading } = useGetClientQuery(clientId);
  const { currentData: history = [] } = useGetClientHistoryQuery(clientId);
  const [updateCredit, { isLoading: savingCredit }] = useUpdateCreditMutation();
  const [setClientStatus] = useSetClientStatusMutation();
  const [setVehicleStatus] = useSetVehicleStatusMutation();

  const [tab, setTab] = useState<TabValue>('vehicles');
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [openingOpen, setOpeningOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<{ open: boolean; vehicle: IVehicle | null }>({
    open: false,
    vehicle: null,
  });
  const [reassigning, setReassigning] = useState<IVehicle | null>(null);

  usePageHeader({
    title: client?.name ?? 'Cliente',
    primaryAction: (
      <HeaderPrimaryAction
        label="Clientes"
        icon="eva:arrow-back-fill"
        variant="soft"
        color="secondary"
        onClick={() => router.push(paths.dashboard.client.list)}
      />
    ),
  });

  if (isLoading || !client) {
    return <LoadingScreen />;
  }

  const active = client.status === 'ACTIVE';

  const toggleCredit = async (reason: string) => {
    try {
      await updateCredit({ id: client.id, creditAllowed: !client.creditAllowed, reason }).unwrap();
      enqueueSnackbar(
        client.creditAllowed ? 'Conta corrente desactivada.' : 'Conta corrente autorizada.'
      );
      setCreditOpen(false);
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível alterar.'), { variant: 'error' });
    }
  };

  const toggleArchive = async () => {
    try {
      await setClientStatus({ id: client.id, archive: active }).unwrap();
      enqueueSnackbar(active ? 'Cliente arquivado.' : 'Cliente reactivado.');
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível alterar.'), { variant: 'error' });
    }
  };

  const toggleVehicle = async (vehicle: IVehicle) => {
    try {
      await setVehicleStatus({ id: vehicle.id, archive: vehicle.status === 'ACTIVE' }).unwrap();
      enqueueSnackbar(vehicle.status === 'ACTIVE' ? 'Viatura arquivada.' : 'Viatura reactivada.');
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível alterar.'), { variant: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title>{client.name}</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          {!active && (
            <Alert severity="warning">Cliente arquivado. O histórico mantém-se disponível.</Alert>
          )}

          <Card>
            <CardContent>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                justifyContent="space-between"
              >
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5">{client.name}</Typography>
                    <Label variant="soft">{CLIENT_TYPE_LABELS[client.clientType]}</Label>
                    <Label variant="soft" color={client.creditAllowed ? 'info' : 'default'}>
                      {client.creditAllowed ? 'Conta corrente autorizada' : 'Sem conta corrente'}
                    </Label>
                  </Stack>
                  <Typography variant="body2">
                    {client.phone ?? 'Sem contacto registado'}
                  </Typography>
                  {client.notes && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {client.notes}
                    </Typography>
                  )}
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  alignItems="flex-start"
                >
                  {active && hasPermission([Authorities.CREATE_ENTRIES]) && (
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                      onClick={() =>
                        router.push(`${paths.dashboard.entry.new}?clientId=${client.id}`)
                      }
                    >
                      Nova entrada
                    </Button>
                  )}
                  {(client.currentDebt ?? 0) > 0 &&
                    hasPermission([Authorities.CREATE_PAYMENTS]) && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Iconify icon="solar:wallet-money-bold-duotone" />}
                        onClick={() => setPaymentOpen(true)}
                      >
                        Receber
                      </Button>
                    )}
                  {hasPermission([Authorities.UPDATE_CLIENTS]) && (
                    <Button variant="outlined" onClick={() => setEditOpen(true)}>
                      Editar
                    </Button>
                  )}
                  {hasPermission([Authorities.MANAGE_CREDIT]) && (
                    <Button variant="outlined" onClick={() => setCreditOpen(true)}>
                      {client.creditAllowed ? 'Desactivar conta' : 'Autorizar conta'}
                    </Button>
                  )}
                  {hasPermission([Authorities.MANAGE_CREDIT]) && (
                    <Button variant="outlined" color="inherit" onClick={() => setOpeningOpen(true)}>
                      Saldo de abertura
                    </Button>
                  )}
                  {hasPermission([Authorities.DELETE_CLIENTS]) && (
                    <Button
                      variant="outlined"
                      color={active ? 'error' : 'inherit'}
                      onClick={toggleArchive}
                    >
                      {active ? 'Arquivar' : 'Reactivar'}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid xs={12} md={4}>
              <SummaryCard label="Total de serviços" value={formatMzn(client.totalServices)} />
            </Grid>
            <Grid xs={12} md={4}>
              <SummaryCard label="Total recebido" value={formatMzn(client.totalReceived)} />
            </Grid>
            <Grid xs={12} md={4}>
              <SummaryCard
                label="Dívida actual"
                value={formatMzn(client.currentDebt)}
                color={(client.currentDebt ?? 0) > 0 ? 'error.main' : 'success.main'}
              />
            </Grid>
          </Grid>

          <Tabs
            value={tab}
            onChange={(_event, value: TabValue) => setTab(value)}
            variant="scrollable"
          >
            <Tab value="vehicles" label={`Viaturas (${client.vehicles.length})`} />
            <Tab value="entries" label="Entradas" />
            <Tab value="payments" label="Pagamentos" />
            {hasPermission([Authorities.READ_STATEMENTS]) && (
              <Tab value="statement" label="Extracto" />
            )}
            <Tab value="history" label="Histórico" />
          </Tabs>

          {tab === 'vehicles' && (
            <Card>
              <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
                {active && hasPermission([Authorities.CREATE_VEHICLES]) && (
                  <Button
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={() => setVehicleForm({ open: true, vehicle: null })}
                  >
                    Nova viatura
                  </Button>
                )}
              </Stack>
              <Scrollbar>
                <Table size="small" sx={{ minWidth: 640 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Matrícula</TableCell>
                      <TableCell>Marca e modelo</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Observações</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {client.vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{vehicle.plate}</Typography>
                        </TableCell>
                        <TableCell>
                          {[vehicle.brand, vehicle.model].filter(Boolean).join(' ') || '—'}
                        </TableCell>
                        <TableCell>{vehicle.categoryLabel}</TableCell>
                        <TableCell>{vehicle.notes ?? ''}</TableCell>
                        <TableCell>
                          <Label
                            variant="soft"
                            color={vehicle.status === 'ACTIVE' ? 'success' : 'default'}
                          >
                            {vehicle.status === 'ACTIVE' ? 'Activa' : 'Arquivada'}
                          </Label>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {hasPermission([Authorities.UPDATE_VEHICLES]) && (
                            <Tooltip title="Editar">
                              <IconButton onClick={() => setVehicleForm({ open: true, vehicle })}>
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {hasPermission([Authorities.REASSIGN_VEHICLES]) &&
                            vehicle.status === 'ACTIVE' && (
                              <Tooltip title="Reassociar a outro cliente">
                                <IconButton onClick={() => setReassigning(vehicle)}>
                                  <Iconify icon="solar:transfer-horizontal-bold-duotone" />
                                </IconButton>
                              </Tooltip>
                            )}
                          {hasPermission([Authorities.DELETE_VEHICLES]) && (
                            <Tooltip title={vehicle.status === 'ACTIVE' ? 'Arquivar' : 'Reactivar'}>
                              <IconButton onClick={() => toggleVehicle(vehicle)}>
                                <Iconify
                                  icon={
                                    vehicle.status === 'ACTIVE'
                                      ? 'solar:archive-down-minimlistic-bold-duotone'
                                      : 'solar:archive-up-minimlistic-bold-duotone'
                                  }
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {client.vehicles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Sem viaturas registadas.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </Card>
          )}

          {tab === 'entries' && <EntriesTable filter={{ clientId: client.id }} hideClient />}
          {tab === 'payments' && <PaymentsTable filter={{ clientId: client.id }} hideClient />}
          {tab === 'statement' && <StatementPanel clientId={client.id} />}
          {tab === 'history' && <HistoryList items={history} />}
        </Stack>
      </Container>

      <ClientFormDialog open={editOpen} client={client} onClose={() => setEditOpen(false)} />
      <PaymentFormDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        client={{ id: client.id, name: client.name }}
      />
      <OpeningBalanceDialog
        open={openingOpen}
        clientId={client.id}
        onClose={() => setOpeningOpen(false)}
      />
      <VehicleFormDialog
        open={vehicleForm.open}
        clientId={client.id}
        vehicle={vehicleForm.vehicle}
        onClose={() => setVehicleForm({ open: false, vehicle: null })}
      />
      <ReassignVehicleDialog vehicle={reassigning} onClose={() => setReassigning(null)} />
      <ReasonDialog
        open={creditOpen}
        title={client.creditAllowed ? 'Desactivar conta corrente' : 'Autorizar conta corrente'}
        description={
          client.creditAllowed
            ? 'Impede novo crédito. As dívidas anteriores continuam visíveis e liquidáveis.'
            : 'O cliente poderá levantar a viatura com saldo por pagar e liquidar mais tarde ou em parte.'
        }
        confirmLabel="Confirmar"
        reasonRequired={false}
        loading={savingCredit}
        onClose={() => setCreditOpen(false)}
        onConfirm={toggleCredit}
      />
    </>
  );
}
