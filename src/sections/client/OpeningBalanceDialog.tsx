import { useEffect, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// components
import { useSnackbar } from 'src/components/snackbar';
import { getApiErrorMessage } from 'src/utils/axios';
import { todayMaputo } from 'src/utils/maputo-time';
// redux
import { useSaveOpeningBalanceMutation } from 'src/redux/services/entryService';
import ResponsiveDialog from '../shared/ResponsiveDialog';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  clientId: number;
  onClose: VoidFunction;
};

/** Saldo de abertura aprovado pelo gestor (migracao a partir do Excel, com data de corte). */
export default function OpeningBalanceDialog({ open, clientId, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [save, { isLoading }] = useSaveOpeningBalanceMutation();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayMaputo());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setAmount('');
      setDate(todayMaputo());
      setNotes('');
    }
  }, [open]);

  const value = Number(amount.replace(',', '.'));

  const handleSubmit = async () => {
    if (!(value > 0)) return;
    try {
      await save({ clientId, amount: value, date, notes: notes.trim() || undefined }).unwrap();
      enqueueSnackbar('Saldo de abertura registado.');
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível registar o saldo.'), {
        variant: 'error',
      });
    }
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Saldo de abertura</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Alert severity="info">
            Fica identificado separadamente e não conta como serviço nem como recebimento novo.
          </Alert>
          <TextField
            label="Montante em dívida (MZN)"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputProps={{ inputMode: 'decimal' }}
          />
          <TextField
            type="date"
            label="Data de corte"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: todayMaputo() }}
          />
          <TextField
            label="Observações (origem, aprovação)"
            multiline
            minRows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Fechar
        </Button>
        <LoadingButton
          variant="contained"
          loading={isLoading}
          disabled={!(value > 0)}
          onClick={handleSubmit}
        >
          Registar
        </LoadingButton>
      </DialogActions>
    </ResponsiveDialog>
  );
}
