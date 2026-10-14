import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { getApiErrorMessage } from 'src/utils/axios';
import { formatDate, formatMzn, todayMaputo } from 'src/utils/maputo-time';
// redux
import {
  useGetExpenseCategoriesQuery,
  useGetExpensesQuery,
  useReverseExpenseMutation,
} from 'src/redux/services/expenseService';
// types
import {
  IExpense,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PaymentMethod,
} from 'src/types/detailing';
//
import ExportButton from '../shared/ExportButton';
import PagedTable from '../shared/PagedTable';
import ReasonDialog from '../shared/ReasonDialog';
import { MovementLabel } from '../shared/StatusLabels';
import ExpenseCategoriesDialog from './ExpenseCategoriesDialog';
import ExpenseFormDialog from './ExpenseFormDialog';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'number', label: 'Número' },
  { id: 'date', label: 'Data' },
  { id: 'description', label: 'Descrição' },
  { id: 'category', label: 'Categoria' },
  { id: 'method', label: 'Método' },
  { id: 'amount', label: 'Valor', align: 'right' as const },
  { id: 'status', label: 'Estado' },
  { id: 'actions', label: '', align: 'right' as const },
];

export default function ExpenseListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [term, setTerm] = useState('');
  const [startDate, setStartDate] = useState(todayMaputo());
  const [endDate, setEndDate] = useState(todayMaputo());
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [createOpen, setCreateOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [toReverse, setToReverse] = useState<IExpense | null>(null);

  const filter = {
    term: term.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    categoryId: categoryId || undefined,
    method: method || undefined,
  };

  const { currentData, isFetching } = useGetExpensesQuery({
    ...filter,
    page,
    size,
    sort: 'expenseDate,desc',
  });
  const { currentData: categories } = useGetExpenseCategoriesQuery({
    page: 0,
    size: 100,
    sort: 'name',
  });
  const [reverseExpense, { isLoading: reversing }] = useReverseExpenseMutation();

  const canReverse = hasPermission([Authorities.REVERSE_EXPENSES]);
  const pageTotal = (currentData?.content ?? []).reduce((sum, item) => sum + item.amount, 0);

  const handleReverse = async (reason: string) => {
    if (!toReverse) return;
    try {
      await reverseExpense({ id: toReverse.id, reason }).unwrap();
      enqueueSnackbar('Despesa corrigida por estorno.');
      setToReverse(null);
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível corrigir.'), {
        variant: 'error',
      });
    }
  };

  usePageHeader({
    title: 'Despesas',
    filtersActive:
      !!categoryId || !!method || startDate !== todayMaputo() || endDate !== todayMaputo(),
    onResetFilters: () => {
      setStartDate(todayMaputo());
      setEndDate(todayMaputo());
      setCategoryId('');
      setMethod('');
      setPage(0);
    },
    filters: (
      <>
        <TextField
          fullWidth
          size="small"
          type="date"
          label="De"
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value);
            setPage(0);
          }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          size="small"
          type="date"
          label="Até"
          value={endDate}
          onChange={(event) => {
            setEndDate(event.target.value);
            setPage(0);
          }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          fullWidth
          size="small"
          label="Categoria"
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value ? Number(event.target.value) : '');
            setPage(0);
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categories?.content.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          size="small"
          label="Método"
          value={method}
          onChange={(event) => {
            setMethod(event.target.value as PaymentMethod | '');
            setPage(0);
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {PAYMENT_METHODS.map((item) => (
            <MenuItem key={item} value={item}>
              {PAYMENT_METHOD_LABELS[item]}
            </MenuItem>
          ))}
        </TextField>
      </>
    ),
    search: {
      value: term,
      placeholder: 'Número ou descrição...',
      onChange: (value) => {
        setTerm(value);
        setPage(0);
      },
      onClear: () => setTerm(''),
    },
    actions: (
      <Stack direction="row" spacing={1}>
        {hasPermission([Authorities.UPDATE_EXPENSES]) && (
          <Button variant="outlined" color="inherit" onClick={() => setCategoriesOpen(true)}>
            Categorias
          </Button>
        )}
        {hasPermission([Authorities.EXPORT_EXPENSES]) && (
          <ExportButton
            context="expenses"
            fileName="despesas"
            params={filter}
            formats={['EXCEL']}
          />
        )}
        {hasPermission([Authorities.CREATE_EXPENSES]) && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => setCreateOpen(true)}
          >
            Registar despesa
          </Button>
        )}
      </Stack>
    ),
  });

  return (
    <>
      <Helmet>
        <title>Despesas</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Total líquido desta página: {formatMzn(pageTotal)}
          </Typography>
          <PagedTable<IExpense>
            columns={COLUMNS}
            rows={currentData?.content ?? []}
            loading={isFetching && !currentData}
            total={currentData?.totalElements ?? 0}
            page={page}
            rowsPerPage={size}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setSize(value);
              setPage(0);
            }}
            renderRow={(row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.number}</TableCell>
                <TableCell>{formatDate(row.expenseDate)}</TableCell>
                <TableCell>
                  <Typography variant="body2">{row.description}</Typography>
                  {row.reason && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Motivo: {row.reason}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{row.categoryName}</TableCell>
                <TableCell>{PAYMENT_METHOD_LABELS[row.method]}</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    whiteSpace: 'nowrap',
                    color: row.amount < 0 ? 'error.main' : 'text.primary',
                  }}
                >
                  {formatMzn(row.amount)}
                </TableCell>
                <TableCell>
                  <MovementLabel kind={row.kind} status={row.status} />
                </TableCell>
                <TableCell align="right">
                  {canReverse && row.kind === 'EXPENSE' && row.status === 'VALID' && (
                    <Tooltip title="Corrigir (estorno)">
                      <IconButton color="error" onClick={() => setToReverse(row)}>
                        <Iconify icon="solar:undo-left-round-bold-duotone" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            )}
          />
        </Stack>
      </Container>

      <ExpenseFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <ExpenseCategoriesDialog open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
      <ReasonDialog
        open={!!toReverse}
        title="Corrigir despesa"
        description={
          toReverse
            ? `${toReverse.number} · ${toReverse.description} · ${formatMzn(
                toReverse.amount
              )}. A despesa não é apagada: é anulada por um estorno com motivo.`
            : undefined
        }
        confirmLabel="Estornar"
        confirmColor="error"
        loading={reversing}
        onClose={() => setToReverse(null)}
        onConfirm={handleReverse}
      />
    </>
  );
}
