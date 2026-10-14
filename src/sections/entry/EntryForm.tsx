import { useEffect, useMemo, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { getApiErrorMessage } from 'src/utils/axios';
import uuidv4 from 'src/utils/uuidv4';
import { formatMzn, toMaputoLocal } from 'src/utils/maputo-time';
// redux
import { useGetServicesQuery } from 'src/redux/services/catalogService';
import { useSaveEntryMutation, useUpdateEntryMutation } from 'src/redux/services/entryService';
// types
import {
  catalogPrice,
  IClient,
  IEntry,
  IServiceItem,
  IVehicle,
  VEHICLE_CATEGORY_LABELS,
  VehicleCategory,
} from 'src/types/detailing';
//
import ClientFormDialog from '../client/ClientFormDialog';
import VehicleFormDialog from '../client/VehicleFormDialog';
import ClientAutocomplete from '../shared/ClientAutocomplete';

// ----------------------------------------------------------------------

type LineState = {
  key: string;
  /** Linha ja gravada: conserva o nome e o preco de catalogo do momento do registo. */
  id?: number;
  serviceId: number | '';
  serviceName?: string;
  /** Preco de referencia gravado na linha (edicao). */
  savedCatalogPrice?: number | null;
  quantity: string;
  unitPrice: string;
  adjustReason: string;
};

const emptyLine = (): LineState => ({
  key: uuidv4(),
  serviceId: '',
  quantity: '1',
  unitPrice: '',
  adjustReason: '',
});

const toNumber = (value: string) => Number(value.replace(',', '.'));

type Props = {
  /** Entrada a editar; ausente = nova entrada. */
  entry?: IEntry;
  /** Cliente da entrada em edicao, ou pre-seleccionado a partir da ficha do cliente. */
  initialClient?: IClient | null;
};

export default function EntryForm({ entry, initialClient }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [saveEntry, { isLoading: saving }] = useSaveEntryMutation();
  const [updateEntry, { isLoading: updating }] = useUpdateEntryMutation();

  const { currentData: servicePage } = useGetServicesQuery({
    page: 0,
    size: 200,
    status: 'ACTIVE',
    sort: 'sortOrder',
  });
  const services = useMemo(() => servicePage?.content ?? [], [servicePage]);

  const [client, setClient] = useState<IClient | null>(initialClient ?? null);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [entryAt, setEntryAt] = useState(toMaputoLocal(entry?.entryAt));
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [lines, setLines] = useState<LineState[]>([emptyLine()]);
  const [submitted, setSubmitted] = useState(false);
  const [clientDialog, setClientDialog] = useState(false);
  const [vehicleDialog, setVehicleDialog] = useState(false);

  const canAdjust = hasPermission([Authorities.ADJUST_PRICES]);

  useEffect(() => {
    setClient(initialClient ?? null);
  }, [initialClient]);

  useEffect(() => {
    const active = (client?.vehicles ?? []).filter((vehicle) => vehicle.status === 'ACTIVE');
    setVehicles(active);
    setVehicleId((current) => {
      // Um refrescamento da ficha do cliente nao deve perder a viatura ja escolhida.
      if (current && active.some((vehicle) => vehicle.id === current)) return current;
      if (entry?.vehicleId && client?.id === entry.clientId) return entry.vehicleId;
      return active.length === 1 ? active[0].id : '';
    });
  }, [client, entry]);

  useEffect(() => {
    if (entry) {
      setLines(
        entry.lines.map((line) => ({
          key: uuidv4(),
          id: line.id,
          serviceId: line.serviceId ?? '',
          serviceName: line.serviceName,
          savedCatalogPrice: line.catalogPrice,
          quantity: String(line.quantity),
          unitPrice: String(line.unitPrice),
          adjustReason: line.adjustReason ?? '',
        }))
      );
    }
  }, [entry]);

  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const category: VehicleCategory | undefined = vehicle?.category;

  const serviceById = (id: number | '') => services.find((service) => service.id === id);

  /** Preco de referencia da linha: o gravado (linhas existentes) ou o do catalogo actual. */
  const referencePrice = (line: LineState): number | null => {
    if (line.id && line.savedCatalogPrice !== undefined) return line.savedCatalogPrice ?? null;
    const service = serviceById(line.serviceId);
    return service && category ? catalogPrice(service, category) : null;
  };

  const lineSubtotal = (line: LineState) => {
    const quantity = toNumber(line.quantity) || 0;
    const price = line.unitPrice === '' ? referencePrice(line) ?? 0 : toNumber(line.unitPrice) || 0;
    return Math.round(quantity * price * 100) / 100;
  };

  const total = lines.reduce((sum, line) => sum + lineSubtotal(line), 0);

  const updateLine = (key: string, patch: Partial<LineState>) =>
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const selectService = (key: string, service: IServiceItem | undefined) =>
    updateLine(key, {
      id: undefined,
      savedCatalogPrice: undefined,
      serviceId: service?.id ?? '',
      serviceName: service?.name,
      quantity: '1',
      unitPrice: '',
      adjustReason: '',
    });

  const availableServices = services.filter(
    (service) => !service.category || !category || service.category === category
  );

  const lineErrors = (line: LineState): string | null => {
    const service = serviceById(line.serviceId);
    const pricing = service?.pricingType;
    if (!line.serviceId) return 'Seleccione o serviço';
    if (!(toNumber(line.quantity) > 0)) return 'Quantidade inválida';
    if (pricing === 'VARIABLE' && !(toNumber(line.unitPrice) > 0)) return 'Indique o preço';
    const reference = referencePrice(line);
    const adjusted =
      line.unitPrice !== '' && reference !== null && toNumber(line.unitPrice) !== reference;
    if (adjusted && !line.adjustReason.trim()) return 'Indique o motivo do ajuste';
    if (!line.id && pricing !== 'VARIABLE' && category && reference === null) {
      return `Sem preço para ${VEHICLE_CATEGORY_LABELS[category]}`;
    }
    return null;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!client || !vehicleId || lines.some((line) => lineErrors(line))) {
      window.requestAnimationFrame(() => {
        document
          .querySelector('[aria-invalid="true"], [data-field-error]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    const data = {
      clientId: client.id,
      vehicleId,
      entryAt: entryAt.length === 16 ? `${entryAt}:00` : entryAt,
      notes: notes.trim() || undefined,
      lines: lines.map((line) => ({
        id: line.id,
        serviceId: Number(line.serviceId),
        quantity: toNumber(line.quantity),
        unitPrice: line.unitPrice === '' ? null : toNumber(line.unitPrice),
        adjustReason: line.adjustReason.trim() || undefined,
      })),
    };

    try {
      const saved = entry
        ? await updateEntry({ id: entry.id, data }).unwrap()
        : await saveEntry(data).unwrap();
      enqueueSnackbar(entry ? 'Entrada actualizada.' : `Entrada ${saved.number} registada.`);
      router.push(paths.dashboard.entry.detail(saved.id));
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'A entrada não foi guardada.'), {
        variant: 'error',
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <Typography variant="subtitle1">Cliente e viatura</Typography>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ md: 'flex-start' }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ flex: 1, minWidth: 0 }}
                alignItems={{ xs: 'stretch', sm: 'flex-start' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ClientAutocomplete
                    value={client}
                    onChange={setClient}
                    disabled={!!entry}
                    error={submitted && !client}
                    helperText={submitted && !client ? 'Seleccione o cliente' : undefined}
                  />
                </Box>
                {!entry && hasPermission([Authorities.CREATE_CLIENTS]) && (
                  <Button
                    sx={{
                      flexShrink: 0,
                      mt: { sm: 1 },
                      minHeight: 44,
                      alignSelf: { xs: 'flex-start', sm: 'auto' },
                    }}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={() => setClientDialog(true)}
                  >
                    Novo cliente
                  </Button>
                )}
              </Stack>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ flex: 1, minWidth: 0 }}
                alignItems={{ xs: 'stretch', sm: 'flex-start' }}
              >
                <TextField
                  select
                  fullWidth
                  label="Viatura"
                  value={vehicleId}
                  disabled={!client}
                  onChange={(event) => {
                    const next = vehicles.find((item) => item.id === Number(event.target.value));
                    if (next && category && next.category !== category) {
                      // Outra categoria: a API recalcula todas as linhas com o catalogo actual.
                      setLines((prev) =>
                        prev.map((line) => ({
                          ...line,
                          id: undefined,
                          savedCatalogPrice: undefined,
                          unitPrice:
                            serviceById(line.serviceId)?.pricingType === 'VARIABLE'
                              ? line.unitPrice
                              : '',
                          adjustReason: '',
                        }))
                      );
                    }
                    setVehicleId(Number(event.target.value));
                  }}
                  error={submitted && !vehicleId}
                  helperText={
                    (submitted && !vehicleId && 'Seleccione a viatura') ||
                    (client && vehicles.length === 0 && 'O cliente não tem viaturas registadas') ||
                    undefined
                  }
                >
                  {vehicles.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.plate} · {item.description} · {item.categoryLabel}
                    </MenuItem>
                  ))}
                </TextField>
                {client && hasPermission([Authorities.CREATE_VEHICLES]) && (
                  <Button
                    sx={{
                      flexShrink: 0,
                      mt: { sm: 1 },
                      minHeight: 44,
                      alignSelf: { xs: 'flex-start', sm: 'auto' },
                    }}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={() => setVehicleDialog(true)}
                  >
                    Nova viatura
                  </Button>
                )}
              </Stack>
            </Stack>
            {client && !client.phone && (
              <Alert severity="warning">Este cliente não tem contacto registado.</Alert>
            )}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                type="datetime-local"
                label="Data e hora"
                value={entryAt}
                onChange={(event) => setEntryAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText={
                  hasPermission([Authorities.BACKDATE_MOVEMENTS])
                    ? undefined
                    : 'Datas anteriores a hoje estão reservadas ao gestor'
                }
                sx={{ minWidth: { md: 240 } }}
              />
              <TextField
                fullWidth
                label="Observações"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
            >
              <Typography variant="subtitle1">
                Serviços {category ? `· ${VEHICLE_CATEGORY_LABELS[category]}` : ''}
              </Typography>
              <Button
                size="small"
                variant="soft"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
                sx={{ minHeight: 44 }}
              >
                Adicionar serviço
              </Button>
            </Stack>

            {!vehicle && (
              <Alert severity="info">
                Seleccione a viatura para aplicar os preços da categoria.
              </Alert>
            )}

            {lines.map((line) => {
              const service = serviceById(line.serviceId);
              const pricing = service?.pricingType;
              const reference = referencePrice(line);
              const priceEditable = pricing === 'VARIABLE' || canAdjust;
              const adjusted =
                line.unitPrice !== '' &&
                reference !== null &&
                toNumber(line.unitPrice) !== reference;
              const error = submitted ? lineErrors(line) : null;
              const keepsArchived = line.id && !service;

              return (
                <Stack key={line.key} spacing={1.5}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    alignItems={{ md: 'center' }}
                  >
                    {keepsArchived ? (
                      <TextField
                        fullWidth
                        disabled
                        label="Serviço"
                        value={line.serviceName ?? ''}
                      />
                    ) : (
                      <TextField
                        select
                        fullWidth
                        label="Serviço"
                        value={line.serviceId}
                        onChange={(event) =>
                          selectService(line.key, serviceById(Number(event.target.value)))
                        }
                        error={!!error && !line.serviceId}
                      >
                        {availableServices.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.code ? `${item.code} — ` : ''}
                            {item.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                    <Stack direction="row" spacing={1.5} sx={{ width: { xs: 1, md: 'auto' } }}>
                      <TextField
                        label={pricing === 'HOURLY' ? 'Horas' : 'Quantidade'}
                        value={line.quantity}
                        onChange={(event) => updateLine(line.key, { quantity: event.target.value })}
                        inputProps={{ inputMode: 'decimal' }}
                        sx={{ flex: { xs: 1, md: 'none' }, width: { md: 120 } }}
                      />
                      <TextField
                        label={pricing === 'HOURLY' ? 'Preço por hora' : 'Preço unitário'}
                        value={line.unitPrice === '' ? reference ?? '' : line.unitPrice}
                        placeholder={pricing === 'VARIABLE' ? 'Introduza o preço' : undefined}
                        disabled={!priceEditable}
                        onChange={(event) =>
                          updateLine(line.key, { unitPrice: event.target.value })
                        }
                        inputProps={{ inputMode: 'decimal' }}
                        sx={{ flex: { xs: 1.4, md: 'none' }, width: { md: 170 } }}
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ width: { xs: 1, md: 'auto' } }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ minWidth: 130, textAlign: { md: 'right' } }}
                      >
                        {formatMzn(lineSubtotal(line))}
                      </Typography>
                      <IconButton
                        color="error"
                        aria-label={`Remover ${line.serviceName ?? 'serviço'}`}
                        sx={{ width: 44, height: 44 }}
                        disabled={lines.length === 1}
                        onClick={() =>
                          setLines((prev) => prev.filter((item) => item.key !== line.key))
                        }
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  {adjusted && (
                    <TextField
                      size="small"
                      label={`Motivo do ajuste (catálogo: ${formatMzn(reference)})`}
                      value={line.adjustReason}
                      onChange={(event) =>
                        updateLine(line.key, { adjustReason: event.target.value })
                      }
                    />
                  )}
                  {error && (
                    <Typography
                      variant="caption"
                      role="alert"
                      data-field-error
                      sx={{ color: 'error.dark' }}
                    >
                      {error}
                    </Typography>
                  )}
                  <Divider sx={{ borderStyle: 'dashed' }} />
                </Stack>
              );
            })}

            <Stack direction="row" justifyContent="flex-end">
              <Typography variant="h6">Total: {formatMzn(total)}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{
          position: { xs: 'sticky', sm: 'static' },
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          mx: { xs: -2, sm: 0 },
          px: { xs: 2, sm: 0 },
          pt: { xs: 1.5, sm: 0 },
          pb: { xs: 'calc(12px + env(safe-area-inset-bottom))', sm: 0 },
          bgcolor: { xs: 'background.default', sm: 'transparent' },
          borderTop: (theme) => ({ xs: `solid 1px ${theme.palette.divider}`, sm: 'none' }),
          '& > .MuiButton-root': { flex: { xs: 1, sm: 'none' }, minHeight: 48 },
        }}
      >
        <Button variant="outlined" color="inherit" onClick={() => router.back()}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          size="large"
          loading={saving || updating}
          onClick={handleSubmit}
        >
          {entry ? 'Guardar alterações' : 'Guardar entrada'}
        </LoadingButton>
      </Stack>

      <ClientFormDialog
        open={clientDialog}
        onClose={() => setClientDialog(false)}
        onSaved={(created) => setClient({ ...created, vehicles: [] })}
      />
      {client && (
        <VehicleFormDialog
          open={vehicleDialog}
          clientId={client.id}
          onClose={() => setVehicleDialog(false)}
          onSaved={(created) => {
            setVehicles((prev) => [...prev, created]);
            setVehicleId(created.id);
          }}
        />
      )}
    </Stack>
  );
}
