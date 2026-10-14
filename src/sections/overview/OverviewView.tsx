import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Box from '@mui/material/Box';
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
import { useResponsive } from 'src/hooks/use-responsive';
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
      <CardContent sx={{ p: { xs: 1.75, sm: 3 }, '&:last-child': { pb: { xs: 1.75, sm: 3 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 1, sm: 2 }}
        >
          <Iconify
            icon={icon}
            sx={{
              width: { xs: 28, sm: 40 },
              height: { xs: 28, sm: 40 },
              color: 'common.white',
              flexShrink: 0,
            }}
          />
          <Stack sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: 'common.white',
                typography: { xs: 'subtitle1', sm: 'h5' },
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.300' }}>
              {label}
            </Typography>
            {caption && (
              <Typography
                variant="caption"
                sx={{ color: 'grey.400', display: { xs: 'none', sm: 'block' } }}
              >
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
  const [showMore, setShowMore] = useState(false);
  const smUp = useResponsive('up', 'sm');

  const { currentData: summary } = useGetSummaryQuery(
    { startDate, endDate },
    { skip: !canSeeSummary }
  );

  usePageHeader({
    title: 'Resumo',
    secondaryActions:
      canSeeSummary && hasPermission([Authorities.EXPORT_DASHBOARD]) ? (
        <ExportButton context="summary" fileName="resumo" params={{ startDate, endDate }} />
      ) : null,
  });

  const quickActionList = [
    hasPermission([Authorities.CREATE_ENTRIES]) && {
      key: 'entry',
      label: 'Nova entrada',
      short: 'Entrada',
      icon: 'solar:wheel-bold-duotone',
      variant: 'contained' as const,
      color: 'primary' as const,
      onClick: () => router.push(paths.dashboard.entry.new),
    },
    hasPermission([Authorities.CREATE_PAYMENTS]) && {
      key: 'payment',
      label: 'Registar pagamento',
      short: 'Pagamento',
      icon: 'solar:wallet-money-bold-duotone',
      variant: 'contained' as const,
      color: 'success' as const,
      onClick: () => setPaymentOpen(true),
    },
    hasPermission([Authorities.CREATE_EXPENSES]) && {
      key: 'expense',
      label: 'Registar despesa',
      short: 'Despesa',
      icon: 'solar:bill-list-bold-duotone',
      variant: 'outlined' as const,
      color: 'primary' as const,
      onClick: () => setExpenseOpen(true),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    short: string;
    icon: string;
    variant: 'contained' | 'outlined';
    color: 'primary' | 'success';
    onClick: VoidFunction;
  }[];

  // Em telemovel, as tres accoes cabem numa linha (icone sobre rotulo curto),
  // libertando a primeira dobra para os indicadores.
  const quickActions = (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: `repeat(${Math.max(quickActionList.length, 1)}, 1fr)`,
          sm: 'repeat(auto-fill, minmax(220px, max-content))',
        },
      }}
    >
      {quickActionList.map((action) => (
        <Button
          key={action.key}
          variant={action.variant}
          color={action.color}
          size="large"
          aria-label={action.label}
          onClick={action.onClick}
          sx={{
            minHeight: { xs: 64, sm: 48 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.5, sm: 1 },
            px: { xs: 1, sm: 2.5 },
            typography: { xs: 'caption', sm: 'button' },
            fontWeight: 700,
          }}
        >
          <Iconify icon={action.icon} width={22} />
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            {action.short}
          </Box>
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {action.label}
          </Box>
        </Button>
      ))}
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>Resumo | {APP_NAME}</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ px: { xs: 2 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
          {quickActions}

          {canSeeSummary && (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  alignItems: 'center',
                  gridTemplateColumns: {
                    xs: 'repeat(auto-fill, minmax(150px, 1fr))',
                    sm: 'repeat(2, 200px) auto',
                  },
                }}
              >
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
                    variant="soft"
                    color="inherit"
                    startIcon={<Iconify icon="solar:calendar-date-bold-duotone" />}
                    sx={{ minHeight: 44, justifySelf: 'start' }}
                    onClick={() => {
                      setStartDate(todayMaputo());
                      setEndDate(todayMaputo());
                    }}
                  >
                    Hoje
                  </Button>
                )}
              </Box>

              {summary && (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: { xs: 1.5, sm: 3 },
                      // 1 coluna a 320 px; 2 a partir de ~360 px; 4 em desktop.
                      gridTemplateColumns: {
                        xs: 'repeat(auto-fill, minmax(150px, 1fr))',
                        md: 'repeat(4, 1fr)',
                      },
                    }}
                  >
                    <Indicator
                      label="Viaturas atendidas"
                      value={String(summary.entriesCount)}
                      caption={`${summary.vehiclesCount} viaturas distintas`}
                      icon="solar:wheel-bold-duotone"
                    />
                    <Indicator
                      label="Recebimentos"
                      value={formatMzn(summary.receipts)}
                      caption="Pela data de recebimento, líquidos de estornos"
                      icon="solar:wallet-money-bold-duotone"
                    />
                    <Indicator
                      label="Por receber do período"
                      value={formatMzn(summary.receivablePeriod)}
                      caption="Saldo actual das entradas do período"
                      icon="solar:hourglass-bold-duotone"
                    />
                    <Indicator
                      label="Dívida total actual"
                      value={formatMzn(summary.totalDebt)}
                      caption="Todos os saldos pendentes"
                      icon="solar:danger-triangle-bold-duotone"
                    />
                    {(showMore || smUp) && (
                      <>
                        <Indicator
                          label="Serviços registados"
                          value={formatMzn(summary.servicesTotal)}
                          caption="Pela data do serviço"
                          icon="solar:clipboard-list-bold-duotone"
                        />
                        <Indicator
                          label="Despesas pagas"
                          value={formatMzn(summary.expenses)}
                          icon="solar:bill-list-bold-duotone"
                        />
                        <Indicator
                          label="Movimento líquido"
                          value={formatMzn(summary.netMovement)}
                          caption="Recebimentos − despesas. Não é lucro nem saldo de caixa."
                          icon="solar:transfer-vertical-bold-duotone"
                        />
                      </>
                    )}
                  </Box>
                  {!smUp && (
                    <Button
                      color="inherit"
                      onClick={() => setShowMore((value) => !value)}
                      endIcon={
                        <Iconify
                          icon={
                            showMore ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      }
                      aria-expanded={showMore}
                      sx={{ alignSelf: 'center', minHeight: 44 }}
                    >
                      {showMore ? 'Menos indicadores' : 'Mais indicadores'}
                    </Button>
                  )}

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
