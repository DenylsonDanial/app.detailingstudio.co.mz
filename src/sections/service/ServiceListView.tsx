import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { getApiErrorMessage } from 'src/utils/axios';
import { formatMzn } from 'src/utils/maputo-time';
// redux
import {
  useGetServicesQuery,
  useSetServiceStatusMutation,
} from 'src/redux/services/catalogService';
// types
import {
  IServiceItem,
  PRICING_TYPE_LABELS,
  RecordStatus,
  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORY_LABELS,
} from 'src/types/detailing';
//
import HeaderPrimaryAction from '../shared/HeaderPrimaryAction';
import PagedTable from '../shared/PagedTable';
import MobileCard from '../shared/MobileCard';
import ServiceFormDialog from './ServiceFormDialog';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'name', label: 'Serviço' },
  { id: 'type', label: 'Tipo de preço' },
  ...VEHICLE_CATEGORIES.map((category) => ({
    id: category,
    label: VEHICLE_CATEGORY_LABELS[category],
    align: 'right' as const,
  })),
  { id: 'status', label: 'Estado' },
  { id: 'actions', label: '', align: 'right' as const },
];

function priceCell(service: IServiceItem, category: (typeof VEHICLE_CATEGORIES)[number]) {
  if (service.category && service.category !== category) return '—';
  switch (service.pricingType) {
    case 'VARIABLE':
      return 'Por trabalho';
    case 'HOURLY':
      return `${formatMzn(service.basePrice)}/h`;
    case 'FIXED':
      return formatMzn(service.basePrice);
    default: {
      const price = service.prices.find((item) => item.category === category);
      return price ? formatMzn(price.price) : '—';
    }
  }
}

export default function ServiceListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [term, setTerm] = useState('');
  const [status, setStatus] = useState<RecordStatus | ''>('ACTIVE');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [form, setForm] = useState<{ open: boolean; service: IServiceItem | null }>({
    open: false,
    service: null,
  });

  const { currentData, isFetching } = useGetServicesQuery({
    page,
    size,
    sort: 'sortOrder',
    term,
    status: status || undefined,
  });
  const [setServiceStatus] = useSetServiceStatusMutation();

  const canUpdate = hasPermission([Authorities.UPDATE_SERVICES]);
  const canArchive = hasPermission([Authorities.DELETE_SERVICES]);

  const toggleArchive = async (service: IServiceItem) => {
    try {
      await setServiceStatus({ id: service.id, archive: service.status === 'ACTIVE' }).unwrap();
      enqueueSnackbar(service.status === 'ACTIVE' ? 'Serviço arquivado.' : 'Serviço reactivado.');
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível alterar.'), { variant: 'error' });
    }
  };

  usePageHeader({
    title: 'Serviços e preços',
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
      placeholder: 'Nome ou código...',
      onChange: (value) => {
        setTerm(value);
        setPage(0);
      },
      onClear: () => setTerm(''),
    },
    primaryAction: hasPermission([Authorities.CREATE_SERVICES]) ? (
      <HeaderPrimaryAction
        label="Novo serviço"
        onClick={() => setForm({ open: true, service: null })}
      />
    ) : null,
  });

  return (
    <>
      <Helmet>
        <title>Serviços e preços</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <PagedTable<IServiceItem>
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
            <MobileCard
              key={row.id}
              title={row.name}
              subtitle={[row.code, PRICING_TYPE_LABELS[row.pricingType]]
                .filter(Boolean)
                .join(' · ')}
              status={
                <Label variant="soft" color={row.status === 'ACTIVE' ? 'success' : 'default'}>
                  {row.status === 'ACTIVE' ? 'Activo' : 'Arquivado'}
                </Label>
              }
              rows={VEHICLE_CATEGORIES.filter(
                (category) => !row.category || row.category === category
              ).map((category) => ({
                label: VEHICLE_CATEGORY_LABELS[category],
                value: priceCell(row, category),
              }))}
              actions={
                canUpdate || canArchive ? (
                  <>
                    {canUpdate && (
                      <Button
                        startIcon={<Iconify icon="solar:pen-bold" />}
                        onClick={() => setForm({ open: true, service: row })}
                        sx={{ minHeight: 44 }}
                      >
                        Editar
                      </Button>
                    )}
                    {canArchive && (
                      <Button
                        color="inherit"
                        onClick={() => toggleArchive(row)}
                        sx={{ minHeight: 44 }}
                      >
                        {row.status === 'ACTIVE' ? 'Arquivar' : 'Reactivar'}
                      </Button>
                    )}
                  </>
                ) : undefined
              }
            />
          )}
          renderRow={(row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography variant="subtitle2">
                  {row.code ? `${row.code} — ` : ''}
                  {row.name}
                </Typography>
              </TableCell>
              <TableCell>{PRICING_TYPE_LABELS[row.pricingType]}</TableCell>
              {VEHICLE_CATEGORIES.map((category) => (
                <TableCell key={category} align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {priceCell(row, category)}
                </TableCell>
              ))}
              <TableCell>
                <Label variant="soft" color={row.status === 'ACTIVE' ? 'success' : 'default'}>
                  {row.status === 'ACTIVE' ? 'Activo' : 'Arquivado'}
                </Label>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {canUpdate && (
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label="Editar"
                      onClick={() => setForm({ open: true, service: row })}
                    >
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                  </Tooltip>
                )}
                {canArchive && (
                  <Tooltip title={row.status === 'ACTIVE' ? 'Arquivar' : 'Reactivar'}>
                    <IconButton
                      aria-label={row.status === 'ACTIVE' ? 'Arquivar' : 'Reactivar'}
                      onClick={() => toggleArchive(row)}
                    >
                      <Iconify
                        icon={
                          row.status === 'ACTIVE'
                            ? 'solar:archive-down-minimlistic-bold-duotone'
                            : 'solar:archive-up-minimlistic-bold-duotone'
                        }
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          )}
        />
      </Container>

      <ServiceFormDialog
        open={form.open}
        service={form.service}
        onClose={() => setForm({ open: false, service: null })}
      />
    </>
  );
}
