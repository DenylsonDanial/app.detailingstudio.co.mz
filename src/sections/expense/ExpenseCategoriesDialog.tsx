import { useState } from 'react';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// components
import { useSnackbar } from 'src/components/snackbar';
import { getApiErrorMessage } from 'src/utils/axios';
// redux
import {
  useGetExpenseCategoriesQuery,
  useSaveExpenseCategoryMutation,
} from 'src/redux/services/expenseService';

// ----------------------------------------------------------------------

/** Categorias de despesa configuraveis (agua, energia, materiais, outros...). */
export default function ExpenseCategoriesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: VoidFunction;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { currentData } = useGetExpenseCategoriesQuery({ page: 0, size: 100, sort: 'name' });
  const [saveCategory, { isLoading }] = useSaveExpenseCategoryMutation();
  const [name, setName] = useState('');

  const save = async (payload: { id?: number; name: string; active?: boolean }) => {
    try {
      await saveCategory(payload).unwrap();
      if (!payload.id) setName('');
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível guardar.'), { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Categorias de despesa</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ pt: 1 }}>
          {currentData?.content.map((category) => (
            <Stack
              key={category.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body2">{category.name}</Typography>
              <FormControlLabel
                label={category.active ? 'Activa' : 'Inactiva'}
                control={
                  <Switch
                    checked={category.active}
                    onChange={(event) =>
                      save({ id: category.id, name: category.name, active: event.target.checked })
                    }
                  />
                }
              />
            </Stack>
          ))}
          <Stack direction="row" spacing={1} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Nova categoria"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              variant="contained"
              disabled={!name.trim() || isLoading}
              onClick={() => save({ name: name.trim() })}
            >
              Adicionar
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
