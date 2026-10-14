import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { formatMzn } from 'src/utils/maputo-time';
// redux
import { useGetClientsQuery } from 'src/redux/services/clientService';
// types
import { CLIENT_TYPE_LABELS, IClient, RecordStatus } from 'src/types/detailing';
//
import PagedTable from '../shared/PagedTable';
import ClientFormDialog from './ClientFormDialog';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'name', label: 'Cliente' },
  { id: 'phone', label: 'Contacto' },
  { id: 'vehicles', label: 'Viaturas' },
  { id: 'credit', label: 'Conta corrente' },
  { id: 'debt', label: 'Dívida actual', align: 'right' as const },
  { id: 'status', label: 'Estado' },
];

export default function ClientListView() {
  const settings = useSettingsContext();
  const router = useRouter();

  const [term, setTerm] = useState('');
  const [status, setStatus] = useState<RecordStatus | ''>('ACTIVE');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [createOpen, setCreateOpen] = useState(false);

  const debouncedTerm = useDebounce(term, 300);

  const { currentData, isFetching } = useGetClientsQuery({
    page,
    size,
    sort: 'name',
    term: debouncedTerm,
    status: status || undefined,
  });

  usePageHeader({
    title: 'Clientes',
    filtersActive: status !== 'ACTIVE',
    onResetFilters: () => setStatus('ACTIVE'),
    filters: (
      <TextField
        select
        fullWidth
        size="small"
        label="Estado"
        value={status}
        onChange={(event) => {
          setStatus(event.target.value as RecordStatus | '');
          setPage(0);
        }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="ACTIVE">Activos</MenuItem>
        <MenuItem value="ARCHIVED">Arquivados</MenuItem>
      </TextField>
    ),
    search: {
      value: term,
      placeholder: 'Nome, contacto ou matrícula...',
      onChange: (value) => {
        setTerm(value);
        setPage(0);
      },
      onClear: () => setTerm(''),
    },
    actions: hasPermission([Authorities.CREATE_CLIENTS]) ? (
      <Button
        variant="contained"
        startIcon={<Iconify icon="eva:plus-fill" />}
        onClick={() => setCreateOpen(true)}
      >
        Novo cliente
      </Button>
    ) : null,
  });

  return (
    <>
      <Helmet>
        <title>Clientes</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <PagedTable<IClient>
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
            <TableRow
              key={row.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => router.push(paths.dashboard.client.detail(row.id))}
            >
              <TableCell>
                <Typography variant="subtitle2">{row.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {CLIENT_TYPE_LABELS[row.clientType]}
                </Typography>
              </TableCell>
              <TableCell>{row.phone ?? '—'}</TableCell>
              <TableCell>
                {row.vehicles.map((vehicle) => vehicle.plate).join(', ') || '—'}
              </TableCell>
              <TableCell>
                <Label variant="soft" color={row.creditAllowed ? 'info' : 'default'}>
                  {row.creditAllowed ? 'Autorizada' : 'Não'}
                </Label>
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  whiteSpace: 'nowrap',
                  color: (row.currentDebt ?? 0) > 0 ? 'error.main' : 'text.primary',
                }}
              >
                {formatMzn(row.currentDebt)}
              </TableCell>
              <TableCell>
                <Label variant="soft" color={row.status === 'ACTIVE' ? 'success' : 'default'}>
                  {row.status === 'ACTIVE' ? 'Activo' : 'Arquivado'}
                </Label>
              </TableCell>
            </TableRow>
          )}
        />
      </Container>

      <ClientFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(client) => router.push(paths.dashboard.client.detail(client.id))}
      />
    </>
  );
}
