import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { todayMaputo } from 'src/utils/maputo-time';
// types
import {
  MovementKind,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PaymentMethod,
} from 'src/types/detailing';
//
import ExportButton from '../shared/ExportButton';
import PaymentFormDialog from './PaymentFormDialog';
import PaymentsTable from './PaymentsTable';

// ----------------------------------------------------------------------

export default function PaymentListView() {
  const settings = useSettingsContext();

  const [term, setTerm] = useState('');
  const [startDate, setStartDate] = useState(todayMaputo());
  const [endDate, setEndDate] = useState(todayMaputo());
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [kind, setKind] = useState<MovementKind | ''>('');
  const [createOpen, setCreateOpen] = useState(false);

  const filter = {
    term: term.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    method: method || undefined,
    kind: kind || undefined,
  };

  usePageHeader({
    title: 'Pagamentos',
    filtersActive: !!method || !!kind || startDate !== todayMaputo() || endDate !== todayMaputo(),
    onResetFilters: () => {
      setStartDate(todayMaputo());
      setEndDate(todayMaputo());
      setMethod('');
      setKind('');
    },
    filters: (
      <>
        <TextField
          fullWidth
          size="small"
          type="date"
          label="De (data de recebimento)"
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
          label="Método"
          value={method}
          onChange={(event) => setMethod(event.target.value as PaymentMethod | '')}
        >
          <MenuItem value="">Todos</MenuItem>
          {PAYMENT_METHODS.map((item) => (
            <MenuItem key={item} value={item}>
              {PAYMENT_METHOD_LABELS[item]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          size="small"
          label="Tipo"
          value={kind}
          onChange={(event) => setKind(event.target.value as MovementKind | '')}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="PAYMENT">Pagamentos</MenuItem>
          <MenuItem value="REVERSAL">Estornos e devoluções</MenuItem>
        </TextField>
      </>
    ),
    search: {
      value: term,
      placeholder: 'Número, cliente ou referência...',
      onChange: setTerm,
      onClear: () => setTerm(''),
    },
    actions: (
      <Stack direction="row" spacing={1}>
        {hasPermission([Authorities.EXPORT_PAYMENTS]) && (
          <ExportButton
            context="payments"
            fileName="recebimentos"
            params={filter}
            formats={['EXCEL']}
          />
        )}
        {hasPermission([Authorities.CREATE_PAYMENTS]) && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => setCreateOpen(true)}
          >
            Registar pagamento
          </Button>
        )}
      </Stack>
    ),
  });

  return (
    <>
      <Helmet>
        <title>Pagamentos</title>
      </Helmet>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <PaymentsTable filter={filter} />
      </Container>
      <PaymentFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
