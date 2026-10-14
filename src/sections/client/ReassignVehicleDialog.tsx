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
// redux
import { useReassignVehicleMutation } from 'src/redux/services/vehicleService';
// types
import { IClient, IVehicle } from 'src/types/detailing';
import ResponsiveDialog from '../shared/ResponsiveDialog';
//
import ClientAutocomplete from '../shared/ClientAutocomplete';

// ----------------------------------------------------------------------

type Props = {
  vehicle: IVehicle | null;
  onClose: VoidFunction;
};

export default function ReassignVehicleDialog({ vehicle, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [reassign, { isLoading }] = useReassignVehicleMutation();
  const [target, setTarget] = useState<IClient | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    setTarget(null);
    setReason('');
  }, [vehicle]);

  const handleSubmit = async () => {
    if (!vehicle || !target || !reason.trim()) return;
    try {
      await reassign({ id: vehicle.id, clientId: target.id, reason: reason.trim() }).unwrap();
      enqueueSnackbar(`Viatura ${vehicle.plate} reassociada a ${target.name}.`);
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível reassociar.'), {
        variant: 'error',
      });
    }
  };

  return (
    <ResponsiveDialog open={!!vehicle} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reassociar viatura {vehicle?.plate}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Alert severity="info">
            Os serviços e dívidas antigos não são transferidos: cada entrada conserva o cliente da
            data do registo.
          </Alert>
          <ClientAutocomplete value={target} onChange={setTarget} label="Novo proprietário" />
          <TextField
            label="Motivo (obrigatório)"
            multiline
            minRows={2}
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
          loading={isLoading}
          disabled={!target || !reason.trim()}
          onClick={handleSubmit}
        >
          Reassociar
        </LoadingButton>
      </DialogActions>
    </ResponsiveDialog>
  );
}
