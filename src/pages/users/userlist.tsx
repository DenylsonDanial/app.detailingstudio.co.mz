import { Helmet } from 'react-helmet-async';
import React, { useEffect, useMemo, useState } from 'react';
// @mui
import {
  Card,
  Table,
  Button,
  Tooltip,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
// routes
import { useSnackbar } from 'src/components/snackbar';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
// @types
import { IUserPage, IUserRow } from '../../types/user';
// _mock_
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/custom-dialog/confirm-dialog';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
  TableSkeleton,
} from '../../components/table';
// sections
import { UserTableRow } from '../../sections/user/list';
import { useDeleteUserMutation, useGetUsersQuery } from '../../redux/services/userService';
import { initialRolePageData, IRolePage } from '../../types/role';
import { useGetRolesQuery } from '../../redux/services/roleService';
import { LoadingScreen } from '../../components/loading-screen';
import { usePageHeader } from '../../layouts/dashboard/page-header-context';
import HeaderPrimaryAction from '../../sections/shared/HeaderPrimaryAction';
import MobileCard from '../../sections/shared/MobileCard';
import Label from '../../components/label';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['Todos', 'Activos', 'Suspensos'];

const TABLE_HEAD = [
  { id: 'name', label: 'Nome', align: 'left' },
  { id: 'roles', label: 'Cargos', align: 'left' },
  { id: 'username', label: 'Nome de utilizador', align: 'left' },
  { id: 'userStatus', label: 'Estado', align: 'left' },
  { id: 'email', label: 'Email', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Page() {
  const {
    page,
    order,
    orderBy,
    rowsPerPage,
    setDense,
    selected,
    setSelected,
    setPage,
    onSelectRow,
    onSelectAllRows,
    onChangeDense,
    //
    onSort,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultRowsPerPage: 25 });

  const { themeStretch } = useSettingsContext();

  const [initialState, setInitialState] = useState<IUserPage>({ size: rowsPerPage, page: 0 });

  const [filterName, setFilterName] = useState('');

  const [filterRole, setFilterRole] = useState('Todos');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('Todos');

  const { enqueueSnackbar } = useSnackbar();

  const { isLoading, currentData } = useGetUsersQuery(initialState);

  const [isLoadingTable, setIsLoadingTable] = useState(true);

  const initialStateRole: IRolePage = initialRolePageData;

  const [deleteUser] = useDeleteUserMutation();

  const { currentData: roles } = useGetRolesQuery(initialStateRole);

  const denseHeight = 40;

  const navigate = useNavigate();

  useEffect(() => {
    setDense(true);
    if (currentData?.content) setIsLoadingTable(false);
  }, [setDense, currentData, isLoading]);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setIsLoadingTable(true);
    let status: string | undefined = '';
    switch (newValue) {
      case 'Suspensos':
        status = 'SUSPENDED';
        break;
      case 'Activos':
        status = 'ACTIVE';
        break;
      default:
        status = undefined;
    }
    setPage(0);
    setFilterStatus(newValue);
    if (newValue === 'Todos') {
      setInitialState({ size: rowsPerPage, page: 0 });
    } else {
      setInitialState({ size: rowsPerPage, page: 0, status });
    }
  };

  const handleFilterRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRole(event.target.value);
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await deleteUser(parseInt(id, 10)).unwrap();
      setSelected([]);
      enqueueSnackbar('Apagado com sucesso!');
    } catch (e) {
      enqueueSnackbar(e.data.message, { variant: 'error' });
    }
  };

  const handleDeleteRows = (selectedRows: string[]) => {
    const deleteRows = currentData?.content?.filter((row) => !selectedRows.includes(`${row.id}`));
    setSelected([]);
  };

  const handleNewUser = () => {
    navigate(paths.dashboard.user.new);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('Todos');
    setFilterStatus('Todos');
    setPage(0);
    setIsLoadingTable(true);
    setInitialState({ size: rowsPerPage, page: 0 });
  };

  const dataFiltered = useMemo(() => {
    let rows = currentData?.content || [];

    if (filterRole !== 'Todos') {
      rows = rows.filter((row) => row.roles?.some((role) => role.name === filterRole));
    }

    if (filterName.trim()) {
      const term = filterName.trim().toLowerCase();
      rows = rows.filter(
        (row) =>
          row.name?.toLowerCase().includes(term) ||
          row.username?.toLowerCase().includes(term) ||
          row.email?.toLowerCase().includes(term)
      );
    }

    return rows;
  }, [currentData?.content, filterRole, filterName]);

  usePageHeader({
    title: 'Lista de Utilizadores',
    filtersActive: filterRole !== 'Todos' || filterStatus !== 'Todos',
    onResetFilters: handleResetFilter,
    filters: (
      <>
        <TextField
          select
          fullWidth
          label="Estado"
          size="small"
          value={filterStatus}
          onChange={handleFilterStatus}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option} value={option} sx={{ typography: 'body2' }}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {roles && (
          <TextField
            select
            fullWidth
            label="Cargo"
            size="small"
            value={filterRole}
            onChange={handleFilterRole}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: { maxHeight: 260 },
                },
              },
            }}
            sx={{ textTransform: 'capitalize' }}
          >
            <MenuItem value="Todos" sx={{ typography: 'body2', textTransform: 'capitalize' }}>
              Todos
            </MenuItem>
            {roles.content.map((option) => (
              <MenuItem
                key={option.id}
                value={option.name}
                sx={{ typography: 'body2', textTransform: 'capitalize' }}
              >
                {option.displayName}
              </MenuItem>
            ))}
          </TextField>
        )}
      </>
    ),
    primaryAction: <HeaderPrimaryAction label="Novo utilizador" onClick={handleNewUser} />,
    search: {
      value: filterName,
      placeholder: 'Procurar pelo nome...',
      onChange: (value) => {
        setPage(0);
        setFilterName(value);
      },
      onClear: () => {
        setFilterName('');
      },
    },
  });

  const changePage = (event: unknown, newPage: number) => {
    setIsLoadingTable(true);
    onChangePage(event, newPage);
    setInitialState({ page: newPage, size: rowsPerPage });
  };

  const changeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeRowsPerPage(event);
    setInitialState({ page: 0, size: parseInt(event.target.value, 10) });
  };

  return (
    <>
      <Helmet>
        <title>Lista de Utilizadores</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' }, mb: 1.5 }}>
          {dataFiltered.map((row) => (
            <MobileCard
              key={row.id}
              title={row.name}
              subtitle={row.email}
              openLabel={`Editar ${row.name}`}
              onOpen={() => navigate(paths.dashboard.user.edit(row.id))}
              status={
                <Label variant="soft" color={row.userStatus === 'ACTIVE' ? 'success' : 'warning'}>
                  {row.userStatus === 'ACTIVE' ? 'Activa' : 'Suspensa'}
                </Label>
              }
              rows={[
                { label: 'Utilizador', value: row.username },
                {
                  label: 'Perfis',
                  value: row.roles.map((role) => role.displayName).join(', ') || '—',
                },
              ]}
            />
          ))}
        </Stack>
        <Card sx={{ '& .MuiTableContainer-root': { display: { xs: 'none', sm: 'block' } } }}>
          {isLoadingTable ? (
            <LoadingScreen />
          ) : (
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction
                numSelected={selected.length}
                rowCount={dataFiltered.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    dataFiltered.map((row: IUserRow) => `${row.id}`)
                  )
                }
                action={
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={handleOpenConfirm}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                }
              />

              <Scrollbar>
                <Table size="small" sx={{ minWidth: 800 }}>
                  <TableHeadCustom
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onSort={onSort}
                    onSelectAllRows={(checked) =>
                      onSelectAllRows(
                        checked,
                        dataFiltered.map((row: IUserRow) => `${row.id}`)
                      )
                    }
                  />

                  {isLoading ? (
                    [...Array(rowsPerPage)]
                  ) : (
                    <TableBody>
                      {dataFiltered.map((row, index) =>
                        row ? (
                          <UserTableRow
                            key={row.id}
                            row={row}
                            selected={selected.includes(`${row.id}`)}
                            onSelectRow={() => onSelectRow(`${row.id}`)}
                            onDeleteRow={() => handleDeleteRow(`${row.id}`)}
                          />
                        ) : (
                          <TableSkeleton key={index} sx={{ height: 40 }} />
                        )
                      )}

                      <TableEmptyRows
                        emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
                      />
                    </TableBody>
                  )}
                </Table>
              </Scrollbar>
            </TableContainer>
          )}

          <TablePaginationCustom
            count={
              filterRole !== 'Todos' || filterName.trim()
                ? dataFiltered.length
                : currentData?.totalElements || 0
            }
            page={!currentData?.totalElements || currentData?.totalElements <= 0 ? 0 : page}
            rowsPerPage={rowsPerPage}
            onPageChange={changePage}
            onRowsPerPageChange={changeRowsPerPage}
            //
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Remover"
        content={
          <>
            Tem certeza que deseja remover <strong> {selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows(selected);
              handleCloseConfirm();
            }}
          >
            Remover
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------
