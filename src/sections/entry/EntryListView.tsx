import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
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
import { todayMaputo } from 'src/utils/maputo-time';
// redux
import { useGetServicesQuery } from 'src/redux/services/catalogService';
// types
import {
  EntryPaymentStatus,
  PAYMENT_STATUS_LABELS,
  WORK_STATUS_LABELS,
  WorkStatus,
} from 'src/types/detailing';
//
import ExportButton from '../shared/ExportButton';
import EntriesTable from './EntriesTable';

// ----------------------------------------------------------------------

export default function EntryListView() {
  const settings = useSettingsContext();
  const router = useRouter();

  const [term, setTerm] = useState('');
  const [startDate, setStartDate] = useState(todayMaputo());
  const [endDate, setEndDate] = useState(todayMaputo());
  const [workStatus, setWorkStatus] = useState<WorkStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<EntryPaymentStatus | ''>('');
  const [serviceId, setServiceId] = useState<number | ''>('');

  const { currentData: services } = useGetServicesQuery({ page: 0, size: 200, sort: 'sortOrder' });

  const filter = {
    term: term.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    workStatus: workStatus || undefined,
    paymentStatus: paymentStatus || undefined,
    serviceId: serviceId || undefined,
  };

  const resetFilters = () => {
    setStartDate(todayMaputo());
    setEndDate(todayMaputo());
    setWorkStatus('');
    setPaymentStatus('');
    setServiceId('');
  };

  usePageHeader({
    title: 'Entradas de viaturas',
    filtersActive:
      !!workStatus ||
      !!paymentStatus ||
      !!serviceId ||
      startDate !== todayMaputo() ||
      endDate !== todayMaputo(),
    onResetFilters: resetFilters,
    filters: (
      <>
        <TextField
          fullWidth
          size="small"
          type="date"
          label="De"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          size="small"
          type="date"
          label="Até"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          fullWidth
          size="small"
          label="Estado do trabalho"
          value={workStatus}
          onChange={(event) => setWorkStatus(event.target.value as WorkStatus | '')}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(WORK_STATUS_LABELS) as WorkStatus[]).map((item) => (
            <MenuItem key={item} value={item}>
              {WORK_STATUS_LABELS[item]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          size="small"
          label="Estado do pagamento"
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value as EntryPaymentStatus | '')}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(PAYMENT_STATUS_LABELS) as EntryPaymentStatus[]).map((item) => (
            <MenuItem key={item} value={item}>
              {PAYMENT_STATUS_LABELS[item]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          size="small"
          label="Serviço"
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value ? Number(event.target.value) : '')}
        >
          <MenuItem value="">Todos</MenuItem>
          {services?.content.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              {service.name}
            </MenuItem>
          ))}
        </TextField>
      </>
    ),
    search: {
      value: term,
      placeholder: 'Número, cliente ou matrícula...',
      onChange: setTerm,
      onClear: () => setTerm(''),
    },
    actions: (
      <Stack direction="row" spacing={1}>
        {hasPermission([Authorities.EXPORT_ENTRIES]) && (
          <ExportButton context="entries" fileName="entradas" params={filter} formats={['EXCEL']} />
        )}
        {hasPermission([Authorities.CREATE_ENTRIES]) && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => router.push(paths.dashboard.entry.new)}
          >
            Nova entrada
          </Button>
        )}
      </Stack>
    ),
  });

  return (
    <>
      <Helmet>
        <title>Entradas de viaturas</title>
      </Helmet>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <EntriesTable filter={filter} />
      </Container>
    </>
  );
}
