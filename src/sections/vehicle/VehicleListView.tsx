import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
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
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// redux
import { useGetVehiclesQuery } from 'src/redux/services/vehicleService';
// types
import { IVehicle, RecordStatus } from 'src/types/detailing';
//
import PagedTable from '../shared/PagedTable';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'plate', label: 'Matrícula' },
  { id: 'description', label: 'Marca e modelo' },
  { id: 'category', label: 'Categoria' },
  { id: 'client', label: 'Proprietário actual' },
  { id: 'status', label: 'Estado' },
];

/** Pesquisa de viaturas por matricula; a gestao faz-se na ficha do cliente. */
export default function VehicleListView() {
  const settings = useSettingsContext();
  const router = useRouter();

  const [term, setTerm] = useState('');
  const [status, setStatus] = useState<RecordStatus | ''>('ACTIVE');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const debouncedTerm = useDebounce(term, 300);

  const { currentData, isFetching } = useGetVehiclesQuery({
    page,
    size,
    sort: 'plate',
    term: debouncedTerm,
    status: status || undefined,
  });

  usePageHeader({
    title: 'Viaturas',
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
        <MenuItem value="">Todas</MenuItem>
        <MenuItem value="ACTIVE">Activas</MenuItem>
        <MenuItem value="ARCHIVED">Arquivadas</MenuItem>
      </TextField>
    ),
    search: {
      value: term,
      placeholder: 'Matrícula, marca, modelo ou cliente...',
      onChange: (value) => {
        setTerm(value);
        setPage(0);
      },
      onClear: () => setTerm(''),
    },
  });

  return (
    <>
      <Helmet>
        <title>Viaturas</title>
      </Helmet>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <PagedTable<IVehicle>
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
          minWidth={640}
          renderRow={(row) => (
            <TableRow
              key={row.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => router.push(paths.dashboard.client.detail(row.clientId))}
            >
              <TableCell>
                <Typography variant="subtitle2">{row.plate}</Typography>
              </TableCell>
              <TableCell>{[row.brand, row.model].filter(Boolean).join(' ') || '—'}</TableCell>
              <TableCell>{row.categoryLabel}</TableCell>
              <TableCell>{row.clientName}</TableCell>
              <TableCell>
                <Label variant="soft" color={row.status === 'ACTIVE' ? 'success' : 'default'}>
                  {row.status === 'ACTIVE' ? 'Activa' : 'Arquivada'}
                </Label>
              </TableCell>
            </TableRow>
          )}
        />
      </Container>
    </>
  );
}
