import { useEffect, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
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
// components
import { useSnackbar } from 'src/components/snackbar';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { getApiErrorMessage } from 'src/utils/axios';
// redux
import {
  useLazyGetDuplicatesQuery,
  useSaveClientMutation,
  useUpdateClientMutation,
} from 'src/redux/services/clientService';
// types
import { CLIENT_TYPE_LABELS, ClientType, IClient } from 'src/types/detailing';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  client?: IClient | null;
  onClose: VoidFunction;
  onSaved?: (client: IClient) => void;
};

export default function ClientFormDialog({ open, client, onClose, onSaved }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [saveClient, { isLoading: saving }] = useSaveClientMutation();
  const [updateClient, { isLoading: updating }] = useUpdateClientMutation();
  const [checkDuplicates, { currentData: duplicates }] = useLazyGetDuplicatesQuery();

  const [name, setName] = useState('');
  const [clientType, setClientType] = useState<ClientType>('INDIVIDUAL');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [creditAllowed, setCreditAllowed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canManageCredit = hasPermission([Authorities.MANAGE_CREDIT]);

  useEffect(() => {
    if (open) {
      setName(client?.name ?? '');
      setClientType(client?.clientType ?? 'INDIVIDUAL');
      setPhone(client?.phone ?? '');
      setNotes(client?.notes ?? '');
      setCreditAllowed(false);
      setSubmitted(false);
    }
  }, [open, client]);

  const handlePhoneBlur = () => {
    if (phone.replace(/\D/g, '').length >= 6) {
      checkDuplicates({ phone, excludeId: client?.id });
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      clientType,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      creditAllowed: client ? undefined : creditAllowed,
    };
    try {
      const saved = client
        ? await updateClient({ id: client.id, data }).unwrap()
        : await saveClient(data).unwrap();
      enqueueSnackbar(client ? 'Cliente actualizado.' : 'Cliente criado.');
      onSaved?.(saved);
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível guardar o cliente.'), {
        variant: 'error',
      });
    }
  };

  const otherClients = phone.trim() ? duplicates ?? [] : [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{client ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Nome (particular ou empresa)"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={submitted && !name.trim()}
            helperText={submitted && !name.trim() ? 'O nome é obrigatório' : undefined}
          />
          <TextField
            select
            label="Tipo de cliente"
            value={clientType}
            onChange={(event) => setClientType(event.target.value as ClientType)}
          >
            {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((type) => (
              <MenuItem key={type} value={type}>
                {CLIENT_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Contacto"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            onBlur={handlePhoneBlur}
          />
          {!phone.trim() && (
            <Alert severity="warning">
              Sem contacto. É recomendado registar um telefone, mas pode continuar.
            </Alert>
          )}
          {otherClients.length > 0 && (
            <Alert severity="warning">
              Possível duplicado — este contacto já está registado para:{' '}
              {otherClients.map((item) => item.name).join(', ')}.
            </Alert>
          )}
          <TextField
            label="Observações"
            multiline
            minRows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          {!client && canManageCredit && (
            <FormControlLabel
              control={
                <Switch
                  checked={creditAllowed}
                  onChange={(event) => setCreditAllowed(event.target.checked)}
                />
              }
              label="Conta corrente autorizada"
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
    </Dialog>
  );
}
