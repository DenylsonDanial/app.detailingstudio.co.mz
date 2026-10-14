import { useEffect, useMemo, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// components
import { useSnackbar } from 'src/components/snackbar';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { getApiErrorMessage } from 'src/utils/axios';
import uuidv4 from 'src/utils/uuidv4';
import { formatDateTime, formatMzn, todayMaputo } from 'src/utils/maputo-time';
// redux
import { useGetOpenEntriesQuery } from 'src/redux/services/entryService';
import { useSavePaymentMutation } from 'src/redux/services/paymentService';
// types
import {
  IClient,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PaymentMethod,
} from 'src/types/detailing';
import ResponsiveDialog from '../shared/ResponsiveDialog';
//
import ClientAutocomplete from '../shared/ClientAutocomplete';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  /** Cliente ja conhecido (ficha do cliente ou entrada). */
  client?: Pick<IClient, 'id' | 'name'> | null;
  /** Entrada a partir da qual se recebe: sugere afectar o pagamento a ela. */
  entryId?: number;
};

const toCents = (value: number) => Math.round(value * 100);

export default function PaymentFormDialog({ open, onClose, client: fixedClient, entryId }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [savePayment, { isLoading }] = useSavePaymentMutation();

  const [picked, setPicked] = useState<IClient | null>(null);
  const [paymentDate, setPaymentDate] = useState(todayMaputo());
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manual, setManual] = useState<Record<number, string>>({});
  const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
  const [submitted, setSubmitted] = useState(false);

  const client = fixedClient ?? picked;
  const fixedId = fixedClient?.id;

  const canBackdate = hasPermission([Authorities.BACKDATE_MOVEMENTS]);

  const { currentData: openEntries = [], isFetching } = useGetOpenEntriesQuery(client?.id ?? 0, {
    skip: !client,
  });

  useEffect(() => {
    if (open) {
      setPicked(null);
      setPaymentDate(todayMaputo());
      setAmount('');
      setMethod('');
      setReference('');
      setNotes('');
      setMode(entryId ? 'manual' : 'auto');
      setManual({});
      setIdempotencyKey(uuidv4());
      setSubmitted(false);
    }
  }, [open, fixedId, entryId]);

  // Ao receber a partir de uma entrada, propoe o saldo dessa entrada.
  useEffect(() => {
    if (open && entryId && openEntries.length) {
      const entry = openEntries.find((item) => item.id === entryId);
      if (entry) {
        setAmount(String(entry.balance));
        setManual({ [entry.id]: String(entry.balance) });
      }
    }
  }, [open, entryId, openEntries]);

  const debt = openEntries.reduce((sum, entry) => sum + entry.balance, 0);
  const amountValue = Number(amount.replace(',', '.')) || 0;

  /** Distribuicao automatica: liquida primeiro as entradas mais antigas (igual a da API). */
  const allocations = useMemo(() => {
    if (mode === 'manual') {
      return openEntries.map((entry) => Number((manual[entry.id] ?? '').replace(',', '.')) || 0);
    }
    let remaining = toCents(amountValue);
    return openEntries.map((entry) => {
      const applied = Math.max(0, Math.min(remaining, toCents(entry.balance)));
      remaining -= applied;
      return applied / 100;
    });
  }, [mode, openEntries, manual, amountValue]);

  const allocated = allocations.reduce((sum, value) => sum + value, 0);

  const errors: string[] = [];
  if (amountValue <= 0) errors.push('Indique um montante positivo.');
  if (toCents(amountValue) > toCents(debt)) {
    errors.push(
      `O montante excede a dívida actual (${formatMzn(debt)}). Adiantamentos não são permitidos.`
    );
  }
  if (mode === 'manual') {
    if (toCents(allocated) !== toCents(amountValue)) {
      errors.push(`A soma afectada (${formatMzn(allocated)}) tem de ser igual ao pagamento.`);
    }
    if (openEntries.some((entry, index) => toCents(allocations[index]) > toCents(entry.balance))) {
      errors.push('Nenhuma afectação pode exceder o saldo da entrada.');
    }
  }

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!client || !method || errors.length) return;
    try {
      const payment = await savePayment({
        clientId: client.id,
        paymentDate,
        amount: amountValue,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        idempotencyKey,
        allocations:
          mode === 'manual'
            ? openEntries
                .map((entry, index) => ({ entryId: entry.id, amount: allocations[index] }))
                .filter((item) => item.amount > 0)
            : [],
      }).unwrap();
      enqueueSnackbar(`Pagamento ${payment.number} registado.`);
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'O pagamento não foi guardado.'), {
        variant: 'error',
      });
    }
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Registar pagamento</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {fixedClient ? (
            <Typography variant="subtitle1">{fixedClient.name}</Typography>
          ) : (
            <ClientAutocomplete
              value={picked}
              onChange={(selected) => setPicked(selected)}
              error={submitted && !client}
              helperText={submitted && !client ? 'Seleccione o cliente' : undefined}
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Data do recebimento"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              disabled={!canBackdate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: todayMaputo() }}
              helperText={canBackdate ? undefined : 'Datas retroactivas estão reservadas ao gestor'}
            />
            <TextField
              fullWidth
              label="Montante (MZN)"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputProps={{ inputMode: 'decimal' }}
              error={submitted && amountValue <= 0}
            />
            <TextField
              fullWidth
              select
              label="Método"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              error={submitted && !method}
            >
              {PAYMENT_METHODS.map((item) => (
                <MenuItem key={item} value={item}>
                  {PAYMENT_METHOD_LABELS[item]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Referência"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
            <TextField
              fullWidth
              label="Observações"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Stack>

          {client && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Typography variant="subtitle2">
                  Distribuição pelas entradas · dívida actual {formatMzn(debt)}
                </Typography>
                <RadioGroup
                  row
                  value={mode}
                  onChange={(event) => setMode(event.target.value as 'auto' | 'manual')}
                >
                  <FormControlLabel
                    value="auto"
                    control={<Radio size="small" />}
                    label="Mais antigas primeiro"
                  />
                  <FormControlLabel
                    value="manual"
                    control={<Radio size="small" />}
                    label="Escolher"
                  />
                </RadioGroup>
              </Stack>

              {!isFetching && openEntries.length === 0 ? (
                <Alert severity="info">O cliente não tem valores por pagar.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Entrada</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Viatura</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                      <TableCell align="right" sx={{ width: 160 }}>
                        A afectar
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {openEntries.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.number}</TableCell>
                        <TableCell>{formatDateTime(entry.entryAt)}</TableCell>
                        <TableCell>{entry.vehiclePlate ?? '—'}</TableCell>
                        <TableCell align="right">{formatMzn(entry.balance)}</TableCell>
                        <TableCell align="right">
                          {mode === 'manual' ? (
                            <TextField
                              size="small"
                              value={manual[entry.id] ?? ''}
                              onChange={(event) =>
                                setManual((prev) => ({ ...prev, [entry.id]: event.target.value }))
                              }
                              inputProps={{ inputMode: 'decimal', style: { textAlign: 'right' } }}
                            />
                          ) : (
                            formatMzn(allocations[index])
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          {submitted &&
            errors.map((message) => (
              <Alert key={message} severity="error">
                {message}
              </Alert>
            ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Fechar
        </Button>
        <LoadingButton variant="contained" loading={isLoading} onClick={handleSubmit}>
          Guardar pagamento
        </LoadingButton>
      </DialogActions>
    </ResponsiveDialog>
  );
}
