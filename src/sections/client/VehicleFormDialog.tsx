import { useEffect, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// components
import { useSnackbar } from 'src/components/snackbar';
import { getApiErrorMessage } from 'src/utils/axios';
// redux
import {
  useSaveVehicleMutation,
  useUpdateVehicleMutation,
} from 'src/redux/services/vehicleService';
// types
import {
  IVehicle,
  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORY_LABELS,
  VehicleCategory,
} from 'src/types/detailing';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  clientId: number;
  vehicle?: IVehicle | null;
  onClose: VoidFunction;
  onSaved?: (vehicle: IVehicle) => void;
};

export default function VehicleFormDialog({ open, clientId, vehicle, onClose, onSaved }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [saveVehicle, { isLoading: saving }] = useSaveVehicleMutation();
  const [updateVehicle, { isLoading: updating }] = useUpdateVehicleMutation();

  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<VehicleCategory | ''>('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setPlate(vehicle?.plate ?? '');
      setBrand(vehicle?.brand ?? '');
      setModel(vehicle?.model ?? '');
      setCategory(vehicle?.category ?? '');
      setNotes(vehicle?.notes ?? '');
      setSubmitted(false);
    }
  }, [open, vehicle]);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!plate.trim() || !category) return;
    const data = {
      clientId,
      plate: plate.trim(),
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      category,
      notes: notes.trim() || undefined,
    };
    try {
      const saved = vehicle
        ? await updateVehicle({ id: vehicle.id, data }).unwrap()
        : await saveVehicle(data).unwrap();
      enqueueSnackbar(vehicle ? 'Viatura actualizada.' : 'Viatura registada.');
      onSaved?.(saved);
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível guardar a viatura.'), {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{vehicle ? 'Editar viatura' : 'Nova viatura'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Matrícula"
            value={plate}
            onChange={(event) => setPlate(event.target.value.toUpperCase())}
            error={submitted && !plate.trim()}
            helperText={submitted && !plate.trim() ? 'A matrícula é obrigatória' : undefined}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Marca"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
            <TextField
              fullWidth
              label="Modelo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </Stack>
          <TextField
            select
            label="Categoria de preço"
            value={category}
            onChange={(event) => setCategory(event.target.value as VehicleCategory)}
            error={submitted && !category}
            helperText={submitted && !category ? 'A categoria é obrigatória' : undefined}
          >
            {VEHICLE_CATEGORIES.map((item) => (
              <MenuItem key={item} value={item}>
                {VEHICLE_CATEGORY_LABELS[item]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Observações"
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
        <LoadingButton variant="contained" loading={saving || updating} onClick={handleSubmit}>
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
