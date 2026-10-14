import { Helmet } from 'react-helmet-async';
import React, { useEffect, useState } from 'react';
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
  Modal,
  Box,
} from '@mui/material';
// routes
import { useSnackbar } from 'src/components/snackbar';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
// @types
import { ITenant, ITenantPage } from '../../types/tenant';
// _mock_
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/custom-dialog/confirm-dialog';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
  TableSkeleton,
} from '../../components/table';
// sections
import { TenantTableRow } from '../../sections/company/list';
import {
  activateCompany,
  deactivateCompany,
  useGetCompaniesQuery,
} from '../../redux/services/companyService';
import { LoadingScreen } from '../../components/loading-screen';
import { usePageHeader } from '../../layouts/dashboard/page-header-context';

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'tenantName', label: 'Nome da empresa', align: 'left' },
  { id: 'tenantId', label: 'Base de dados', align: 'left' },
  { id: 'isActive', label: 'Estado', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Page() {
  const {
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    setDense,
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultRowsPerPage: 25 });

  const { themeStretch } = useSettingsContext();

  const [currentTenant] = useState({
    id: 0,
    name: '',
    displayName: '',
    contextPath: '',
    bundler: '',
  });
  const [initialState, setInitialState] = useState<ITenantPage>({ size: rowsPerPage, page: 0 });
  const [filterName, setFilterName] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, currentData } = useGetCompaniesQuery(initialState);
  const [isLoadingTable, setIsLoadingTable] = useState(true);

  const navigate = useNavigate();
  const denseHeight = 40;

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

  const handleActivateOrDeactivate = async (row: ITenant, action: string) => {
    try {
      if (action === 'activate') {
        await activateCompany(row.id);
        enqueueSnackbar('Activado com sucesso!');
      } else {
        await deactivateCompany(row.id);
        enqueueSnackbar('Desactivado com sucessso!');
      }
      setInitialState({ size: rowsPerPage, page: 0, term: '' });
    } catch (error) {
      if (error?.data?.length > 0) {
        error.data.forEach((item: string) => enqueueSnackbar(item, { variant: 'error' }));
      } else {
        enqueueSnackbar(
          error.status === 500 ? 'Ocorreu um erro inesperado' : 'Verifique os dados introduzidos.',
          { variant: 'error' }
        );
      }
    }
  };

  const handleNewCompany = () => {
    navigate(paths.dashboard.company.new);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setInitialState({ size: rowsPerPage, page: 0, term: '' });
  };

  usePageHeader({
    title: 'Lista de empresas',
    actions: (
      <Button
        onClick={() => handleNewCompany()}
        variant="contained"
        startIcon={<Iconify icon="eva:plus-fill" />}
      >
        Adicionar
      </Button>
    ),
    search: {
      value: filterName,
      onChange: (value) => {
        setPage(0);
        setFilterName(value);
        setInitialState({ size: rowsPerPage, page: 0, term: value });
      },
      onClear: handleResetFilter,
    },
  });

  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

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
        <title>Lista de empresas</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Card>
          {isLoadingTable ? (
            <LoadingScreen />
          ) : (
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction
                numSelected={selected.length}
                rowCount={currentData?.content?.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(checked, currentData?.content?.map((row) => `${row.id}`) || [''])
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
                    rowCount={currentData?.content?.length}
                    onSort={onSort}
                  />

                  {isLoading ? (
                    [...Array(rowsPerPage)]
                  ) : (
                    <TableBody>
                      {currentData?.content?.map((row, index) =>
                        row ? (
                          <TenantTableRow
                            key={row.id}
                            row={row}
                            selected={selected.includes(`${row.id}`)}
                            onSelectRow={() => onSelectRow(`${row.id}`)}
                            onDeactivate={() => handleActivateOrDeactivate(row, 'deactivate')}
                            onActivate={() => handleActivateOrDeactivate(row, 'activate')}
                          />
                        ) : (
                          <TableSkeleton key={index} sx={{ height: denseHeight }} />
                        )
                      )}

                      <TableNoData notFound={notFound} />
                      <TableEmptyRows emptyRows={emptyRows(page, rowsPerPage, 5)} />
                    </TableBody>
                  )}
                </Table>
              </Scrollbar>
            </TableContainer>
          )}

          <TablePaginationCustom
            count={currentData?.totalElements || 0}
            page={!currentData?.totalElements || currentData?.totalElements <= 0 ? 0 : page}
            rowsPerPage={rowsPerPage}
            onPageChange={changePage}
            onRowsPerPageChange={changeRowsPerPage}
            //
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>
    </>
  );
}
