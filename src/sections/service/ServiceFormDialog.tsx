import { useEffect, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// components
import { useSnackbar } from 'src/components/snackbar';
import { getApiErrorMessage } from 'src/utils/axios';
// redux
import {
  useSaveServiceMutation,
  useUpdateServiceMutation,
} from 'src/redux/services/catalogService';
// types
import {
  IServiceItem,
  PRICING_TYPE_LABELS,
  PricingType,
  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORY_LABELS,
  VehicleCategory,
} from 'src/types/detailing';
import ResponsiveDialog from '../shared/ResponsiveDialog';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  service?: IServiceItem | null;
  onClose: VoidFunction;
};

const toNumber = (value: string) => Number(value.replace(',', '.'));

export default function ServiceFormDialog({ open, service, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [saveService, { isLoading: saving }] = useSaveServiceMutation();
  const [updateService, { isLoading: updating }] = useUpdateServiceMutation();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('BY_CATEGORY');
  const [basePrice, setBasePrice] = useState('');
  const [category, setCategory] = useState<VehicleCategory | ''>('');
  const [sortOrder, setSortOrder] = useState('');
  const [prices, setPrices] = useState<Record<VehicleCategory, string>>({
    TURISMO: '',
    SUV: '',
    BUS: '',
    MOTA: '',
  });
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setCode(service?.code ?? '');
      setName(service?.name ?? '');
      setPricingType(service?.pricingType ?? 'BY_CATEGORY');
      setBasePrice(service?.basePrice != null ? String(service.basePrice) : '');
      setCategory(service?.category ?? '');
      setSortOrder(service ? String(service.sortOrder) : '');
      const current = { TURISMO: '', SUV: '', BUS: '', MOTA: '' };
      service?.prices.forEach((item) => {
        current[item.category] = String(item.price);
      });
      setPrices(current);
      setReason('');
      setSubmitted(false);
    }
  }, [open, service]);

  const needsBase = pricingType === 'FIXED' || pricingType === 'HOURLY';
  const filledPrices = VEHICLE_CATEGORIES.filter((item) => prices[item].trim() !== '');

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!name.trim()) return;
    if (needsBase && !(toNumber(basePrice) >= 0 && basePrice.trim())) return;
    if (pricingType === 'BY_CATEGORY' && filledPrices.length === 0) return;
    if (service && !reason.trim()) return;

    const data = {
      code: code.trim() || undefined,
      name: name.trim(),
      pricingType,
      basePrice: needsBase ? toNumber(basePrice) : null,
      category: category || null,
      sortOrder: sortOrder ? Number(sortOrder) : undefined,
      prices:
        pricingType === 'BY_CATEGORY'
          ? filledPrices.map((item) => ({ category: item, price: toNumber(prices[item]) }))
          : [],
      reason: reason.trim() || undefined,
    };
    try {
      if (service) {
        await updateService({ id: service.id, data }).unwrap();
      } else {
        await saveService(data).unwrap();
      }
      enqueueSnackbar(service ? 'Serviço actualizado.' : 'Serviço criado.');
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível guardar.'), { variant: 'error' });
    }
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{service ? 'Editar serviço' : 'Novo serviço'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {service && (
            <Alert severity="info">
              Alterar o catálogo não modifica entradas anteriores; as novas entradas usam os valores
              actualizados.
            </Alert>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Código"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              sx={{ width: { sm: 140 } }}
            />
            <TextField
              fullWidth
              label="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={submitted && !name.trim()}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Tipo de preço"
              value={pricingType}
              onChange={(event) => setPricingType(event.target.value as PricingType)}
            >
              {(Object.keys(PRICING_TYPE_LABELS) as PricingType[]).map((item) => (
                <MenuItem key={item} value={item}>
                  {PRICING_TYPE_LABELS[item]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Aplica-se a"
              value={category}
              onChange={(event) => setCategory(event.target.value as VehicleCategory | '')}
            >
              <MenuItem value="">Todas as categorias</MenuItem>
              {VEHICLE_CATEGORIES.map((item) => (
                <MenuItem key={item} value={item}>
                  Só {VEHICLE_CATEGORY_LABELS[item]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {needsBase && (
            <TextField
              label={pricingType === 'HOURLY' ? 'Preço por hora (MZN)' : 'Preço (MZN)'}
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              inputProps={{ inputMode: 'decimal' }}
              error={submitted && !basePrice.trim()}
            />
          )}
          {pricingType === 'VARIABLE' && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              O preço é introduzido em cada trabalho e é obrigatório na entrada.
            </Typography>
          )}
          {pricingType === 'BY_CATEGORY' && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {VEHICLE_CATEGORIES.map((item) => (
                <TextField
                  key={item}
                  label={VEHICLE_CATEGORY_LABELS[item]}
                  value={prices[item]}
                  onChange={(event) =>
                    setPrices((prev) => ({ ...prev, [item]: event.target.value }))
                  }
                  inputProps={{ inputMode: 'decimal' }}
                  error={submitted && filledPrices.length === 0}
                />
              ))}
            </Stack>
          )}

          <TextField
            label="Ordem na lista"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value.replace(/\D/g, ''))}
            sx={{ width: 160 }}
          />

          {service && (
            <TextField
              label="Motivo da alteração (obrigatório)"
              multiline
              minRows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              error={submitted && !reason.trim()}
            />
          )}
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
    </ResponsiveDialog>
  );
}
