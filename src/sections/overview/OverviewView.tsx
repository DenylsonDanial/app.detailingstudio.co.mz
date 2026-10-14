import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// config
import { APP_NAME } from 'src/config-global';
import { NAV_CHROME } from 'src/layouts/config-layout';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { formatMzn, todayMaputo } from 'src/utils/maputo-time';
// redux
import { useGetSummaryQuery } from 'src/redux/services/reportService';
// types
import { IMethodAmount, WORK_FLOW, WORK_STATUS_LABELS } from 'src/types/detailing';
//
import EntriesTable from '../entry/EntriesTable';
import ExpenseFormDialog from '../expense/ExpenseFormDialog';
import PaymentFormDialog from '../payment/PaymentFormDialog';
import ExportButton from '../shared/ExportButton';

// ----------------------------------------------------------------------

function Indicator({
  label,
  value,
  icon,
  caption,
}: {
  label: string;
  value: string;
  icon: string;
  caption?: string;
}) {
  return (
    <Card
      sx={{
        height: 1,
        bgcolor: NAV_CHROME.bgcolor,
        border: `1px solid ${NAV_CHROME.borderColor}`,
        boxShadow: 'none',
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify icon={icon} width={40} sx={{ color: 'common.white', flexShrink: 0 }} />
          <Stack>
            <Typography variant="h5" sx={{ color: 'common.white' }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              {label}
            </Typography>
            {caption && (
              <Typography variant="caption" sx={{ color: 'grey.500' }}>
                {caption}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MethodBreakdown({
  title,
  items,
  total,
}: {
  title: string;
  items: IMethodAmount[];
  total: number;
}) {
  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={title} />
      <Stack spacing={1.5} sx={{ p: 3 }}>
        {items.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sem movimentos no período.
          </Typography>
        )}
        {items.map((item) => (
          <Stack key={item.method} direction="row" justifyContent="space-between">
            <Typography variant="body2">{item.label}</Typography>
            <Typography variant="subtitle2">{formatMzn(item.amount)}</Typography>
          </Stack>
        ))}
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle2">Total</Typography>
          <Typography variant="subtitle2">{formatMzn(total)}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function OverviewView() {
  const settings = useSettingsContext();
  const router = useRouter();

  const canSeeSummary = hasPermission([Authorities.READ_DASHBOARD]);
  const [startDate, setStartDate] = useState(todayMaputo());
  const [endDate, setEndDate] = useState(todayMaputo());
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const { currentData: summary } = useGetSummaryQuery(
    { startDate, endDate },
    { skip: !canSeeSummary }
  );

  usePageHeader({
    title: 'Resumo',
    actions:
      canSeeSummary && hasPermission([Authorities.EXPORT_DASHBOARD]) ? (
        <ExportButton context="summary" fileName="resumo" params={{ startDate, endDate }} />
      ) : null,
  });

  const quickActions = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      {hasPermission([Authorities.CREATE_ENTRIES]) && (
        <Button
          variant="contained"
          size="large"
          startIcon={<Iconify icon="solar:wheel-bold-duotone" />}
          onClick={() => router.push(paths.dashboard.entry.new)}
        >
          Nova entrada
        </Button>
      )}
      {hasPermission([Authorities.CREATE_PAYMENTS]) && (
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<Iconify icon="solar:wallet-money-bold-duotone" />}
          onClick={() => setPaymentOpen(true)}
        >
          Registar pagamento
        </Button>
      )}
      {hasPermission([Authorities.CREATE_EXPENSES]) && (
        <Button
          variant="outlined"
          size="large"
          startIcon={<Iconify icon="solar:bill-list-bold-duotone" />}
          onClick={() => setExpenseOpen(true)}
        >
          Registar despesa
        </Button>
      )}
    </Stack>
  );

  return (
    <>
      <Helmet>
        <title>Resumo | {APP_NAME}</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          {quickActions}

          {canSeeSummary && (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  type="date"
                  label="De"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Até"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                {(startDate !== todayMaputo() || endDate !== todayMaputo()) && (
                  <Button
                    color="inherit"
                    onClick={() => {
                      setStartDate(todayMaputo());
                      setEndDate(todayMaputo());
                    }}
                  >
                    Hoje
                  </Button>
                )}
              </Stack>

              {summary && (
                <>
                  <Grid container spacing={3}>
                    <Grid xs={12} sm={6} md={3}>
                      <Indicator
                        label="Viaturas atendidas"
                        value={String(summary.entriesCount)}
                        caption={`${summary.vehiclesCount} viaturas distintas`}
                        icon="solar:wheel-bold-duotone"
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={3}>
                      <Indicator
                        label="Serviços registados"
                        value={formatMzn(summary.servicesTotal)}
                        caption="Pela data do serviço"
                        icon="solar:clipboard-list-bold-duotone"
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={3}>
                      <Indicator
                        label="Recebimentos do período"
                        value={formatMzn(summary.receipts)}
                        caption="Pela data de recebimento, líquidos de estornos"
                        icon="solar:wallet-money-bold-duotone"
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={3}>
                      <Indicator
                        label="Despesas pagas"
                        value={formatMzn(summary.expenses)}
                        icon="solar:bill-list-bold-duotone"
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Indicator
                        label="Movimento líquido"
                        value={formatMzn(summary.netMovement)}
                        caption="Recebimentos − despesas. Não é lucro nem saldo de caixa."
                        icon="solar:transfer-vertical-bold-duotone"
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Indicator
                        label="Por receber do período"
                        value={formatMzn(summary.receivablePeriod)}
                        caption="Saldo actual das entradas do período"
                        icon="solar:hourglass-bold-duotone"
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Indicator
                        label="Dívida total actual"
                        value={formatMzn(summary.totalDebt)}
                        caption="Todos os saldos pendentes"
                        icon="solar:danger-triangle-bold-duotone"
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid xs={12} md={4}>
                      <MethodBreakdown
                        title="Recebimentos por método"
                        items={summary.receiptsByMethod}
                        total={summary.receipts}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <MethodBreakdown
                        title="Despesas por método"
                        items={summary.expensesByMethod}
                        total={summary.expenses}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Card sx={{ height: 1 }}>
                        <CardHeader title="Trabalhos do período" />
                        <Stack spacing={1.5} sx={{ p: 3 }}>
                          {[...WORK_FLOW, 'CANCELLED' as const].map((status) => (
                            <Stack key={status} direction="row" justifyContent="space-between">
                              <Typography variant="body2">{WORK_STATUS_LABELS[status]}</Typography>
                              <Typography variant="subtitle2">
                                {summary.workStatusCounts[status] ?? 0}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                </>
              )}
            </>
          )}

          {hasPermission([Authorities.READ_ENTRIES]) && (
            <Stack spacing={1.5}>
              <Typography variant="h6">
                Entradas {canSeeSummary ? 'do período' : 'de hoje'}
              </Typography>
              <EntriesTable
                filter={
                  canSeeSummary
                    ? { startDate, endDate }
                    : { startDate: todayMaputo(), endDate: todayMaputo() }
                }
              />
            </Stack>
          )}
        </Stack>
      </Container>

      <PaymentFormDialog open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <ExpenseFormDialog open={expenseOpen} onClose={() => setExpenseOpen(false)} />
    </>
  );
}
