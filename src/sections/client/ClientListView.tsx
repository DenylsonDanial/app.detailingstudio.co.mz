import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSessionState } from 'src/hooks/use-session-state';
// @mui
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
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
import HeaderPrimaryAction from '../shared/HeaderPrimaryAction';
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

function ClientMobileCard({ client, onOpen }: { client: IClient; onOpen: VoidFunction }) {
  const vehicles = client.vehicles.map((vehicle) => vehicle.plate).join(', ') || '—';

  return (
    <Card>
      <CardActionArea onClick={onOpen} aria-label={`Abrir cliente ${client.name}`}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle1" noWrap>
                {client.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {CLIENT_TYPE_LABELS[client.clientType]}
              </Typography>
            </Box>
            <Label variant="soft" color={client.status === 'ACTIVE' ? 'success' : 'default'}>
              {client.status === 'ACTIVE' ? 'Activo' : 'Arquivado'}
            </Label>
            <Iconify icon="eva:chevron-right-fill" sx={{ mt: 0.5, flexShrink: 0 }} />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                Contacto
              </Typography>
              <Typography variant="body2" noWrap sx={{ minWidth: 0, textAlign: 'right' }}>
                {client.phone ?? '—'}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                Viaturas
              </Typography>
              <Typography
                variant="body2"
                noWrap
                title={vehicles}
                sx={{ minWidth: 0, maxWidth: '70%', textAlign: 'right' }}
              >
                {vehicles}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Conta corrente
              </Typography>
              <Label variant="soft" color={client.creditAllowed ? 'info' : 'default'}>
                {client.creditAllowed ? 'Autorizada' : 'Não'}
              </Label>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Dívida actual
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  whiteSpace: 'nowrap',
                  color: (client.currentDebt ?? 0) > 0 ? 'error.main' : 'text.primary',
                }}
              >
                {formatMzn(client.currentDebt)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function ClientListView() {
  const settings = useSettingsContext();
  const router = useRouter();

  const [term, setTerm] = useSessionState('clients.term', '');
  const [status, setStatus] = useSessionState<RecordStatus | ''>('clients.status', 'ACTIVE');
  const [page, setPage] = useSessionState('clients.page', 0);
  const [size, setSize] = useSessionState('clients.size', 25);
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
    primaryAction: hasPermission([Authorities.CREATE_CLIENTS]) ? (
      <HeaderPrimaryAction label="Novo cliente" onClick={() => setCreateOpen(true)} />
    ) : null,
  });

  return (
    <>
      <Helmet>
        <title>Clientes</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ px: { xs: 2 } }}>
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
          mobileRenderRow={(row) => (
            <ClientMobileCard
              key={row.id}
              client={row}
              onOpen={() => router.push(paths.dashboard.client.detail(row.id))}
            />
          )}
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
