import { useEffect, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// components
import { useSnackbar } from 'src/components/snackbar';
import { getApiErrorMessage } from 'src/utils/axios';
import { formatDate, formatMzn, todayMaputo } from 'src/utils/maputo-time';
// redux
import { useReversePaymentMutation } from 'src/redux/services/paymentService';
// types
import {
  IPayment,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PaymentMethod,
} from 'src/types/detailing';

// ----------------------------------------------------------------------

type Props = {
  payment: IPayment | null;
  onClose: VoidFunction;
};

/**
 * Estorno com motivo. Distingue a correccao de registo (anula o pagamento na sua
 * data) da devolucao efectiva de dinheiro (com data e metodo da devolucao).
 */
export default function PaymentReverseDialog({ payment, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [reversePayment, { isLoading }] = useReversePaymentMutation();

  const [reason, setReason] = useState('');
  const [refund, setRefund] = useState(false);
  const [refundDate, setRefundDate] = useState(todayMaputo());
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('CASH');

  useEffect(() => {
    if (payment) {
      setReason('');
      setRefund(false);
      setRefundDate(todayMaputo());
      setRefundMethod(payment.method);
    }
  }, [payment]);

  const handleSubmit = async () => {
    if (!payment || !reason.trim()) return;
    try {
      const reversal = await reversePayment({
        id: payment.id,
        data: {
          reason: reason.trim(),
          refund,
          refundDate: refund ? refundDate : undefined,
          refundMethod: refund ? refundMethod : undefined,
        },
      }).unwrap();
      enqueueSnackbar(`Estorno ${reversal.number} registado. A dívida foi reposta.`);
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível estornar.'), {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog open={!!payment} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Estornar pagamento</DialogTitle>
      <DialogContent>
        {payment && (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography variant="body2">
              {payment.number} · {payment.clientName} · {formatDate(payment.paymentDate)} ·{' '}
              {formatMzn(payment.amount)} ({PAYMENT_METHOD_LABELS[payment.method]})
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              O pagamento não é apagado: é registado um movimento de sinal contrário, ligado ao
              original, que repõe os saldos das entradas.
            </Typography>
            <TextField
              autoFocus
              multiline
              minRows={2}
              label="Motivo (obrigatório)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <FormControlLabel
              control={
                <Switch checked={refund} onChange={(event) => setRefund(event.target.checked)} />
              }
              label="Houve devolução efectiva de dinheiro ao cliente"
            />
            {refund && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data da devolução"
                  value={refundDate}
                  onChange={(event) => setRefundDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: todayMaputo() }}
                />
                <TextField
                  fullWidth
                  select
                  label="Método da devolução"
                  value={refundMethod}
                  onChange={(event) => setRefundMethod(event.target.value as PaymentMethod)}
                >
                  {PAYMENT_METHODS.map((item) => (
                    <MenuItem key={item} value={item}>
                      {PAYMENT_METHOD_LABELS[item]}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Fechar
        </Button>
        <LoadingButton
          variant="contained"
          color="error"
          loading={isLoading}
          disabled={!reason.trim()}
          onClick={handleSubmit}
        >
          Estornar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
