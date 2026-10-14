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
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { getApiErrorMessage } from 'src/utils/axios';
import { todayMaputo } from 'src/utils/maputo-time';
// redux
import {
  useGetExpenseCategoriesQuery,
  useSaveExpenseMutation,
} from 'src/redux/services/expenseService';
// types
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, PaymentMethod } from 'src/types/detailing';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
};

/** Regista uma despesa efectivamente paga. */
export default function ExpenseFormDialog({ open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [saveExpense, { isLoading }] = useSaveExpenseMutation();
  const { currentData: categories } = useGetExpenseCategoriesQuery({
    page: 0,
    size: 100,
    sort: 'name',
  });

  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayMaputo());
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canBackdate = hasPermission([Authorities.BACKDATE_MOVEMENTS]);

  useEffect(() => {
    if (open) {
      setDescription('');
      setCategoryId('');
      setAmount('');
      setExpenseDate(todayMaputo());
      setMethod('');
      setNotes('');
      setSubmitted(false);
    }
  }, [open]);

  const value = Number(amount.replace(',', '.'));

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!description.trim() || !categoryId || !(value > 0) || !method) return;
    try {
      const expense = await saveExpense({
        description: description.trim(),
        categoryId,
        amount: value,
        expenseDate,
        method,
        notes: notes.trim() || undefined,
      }).unwrap();
      enqueueSnackbar(`Despesa ${expense.number} registada.`);
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'A despesa não foi guardada.'), {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registar despesa</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Descrição"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            error={submitted && !description.trim()}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Categoria"
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
              error={submitted && !categoryId}
            >
              {categories?.content
                .filter((category) => category.active)
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              fullWidth
              label="Valor (MZN)"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputProps={{ inputMode: 'decimal' }}
              error={submitted && !(value > 0)}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Data do pagamento"
              value={expenseDate}
              disabled={!canBackdate}
              onChange={(event) => setExpenseDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: todayMaputo() }}
            />
            <TextField
              select
              fullWidth
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
        <LoadingButton variant="contained" loading={isLoading} onClick={handleSubmit}>
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
