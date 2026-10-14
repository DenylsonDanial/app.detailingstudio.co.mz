import { ReactNode, useEffect, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  confirmColor?: 'primary' | 'error' | 'warning';
  /** Falso quando o motivo e opcional. */
  reasonRequired?: boolean;
  loading?: boolean;
  onClose: VoidFunction;
  onConfirm: (reason: string) => void;
};

/** Pede o motivo de uma accao sensivel (cancelar, estornar, autorizar). */
export default function ReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmColor = 'primary',
  reasonRequired = true,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const invalid = reasonRequired && !reason.trim();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {description}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label={reasonRequired ? 'Motivo (obrigatório)' : 'Motivo'}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Fechar
        </Button>
        <LoadingButton
          variant="contained"
          color={confirmColor}
          loading={loading}
          disabled={invalid}
          onClick={() => onConfirm(reason.trim())}
        >
          {confirmLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
