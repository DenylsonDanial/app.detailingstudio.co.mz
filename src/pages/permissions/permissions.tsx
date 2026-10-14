import { Helmet } from 'react-helmet-async';
import React, {useEffect, useState} from 'react';
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
    Modal, Box
} from '@mui/material';
// routes
import { useSnackbar } from 'src/components/snackbar';
// @types
import { IPermissionPage } from '../../types/permission';
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
  TablePaginationCustom, TableSkeleton,
} from '../../components/table';
// sections
import { PermissionTableRow } from '../../sections/permission/list';
import PermissionNewEditForm from "../../sections/permission/PermissionNewEditForm";
import {
  useDeletePermissionMutation,
  useGetPermissionsPaginatedQuery,

} from '../../redux/services/permissionService';
import { LoadingScreen } from '../../components/loading-screen';
import { usePageHeader } from '../../layouts/dashboard/page-header-context';

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'name', label: 'Valor', align: 'left' },
  { id: 'displayName', label: 'Nome a apresentar', align: 'left' },
  { id: 'contextPath', label: 'Url de contexto', align: 'left' },
  { id: 'bundler', label: 'Grupo', align: 'left' },
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
  } = useTable({defaultRowsPerPage: 25});


  const { themeStretch } = useSettingsContext();

  const [currentPermission] = useState({id: 0, name: '', displayName: '', contextPath: '', bundler: ''});
  const [initialState, setInitialState] = useState<IPermissionPage>({size: rowsPerPage, page: 0});
  const [filterName, setFilterName] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, currentData } = useGetPermissionsPaginatedQuery(initialState);
  const [deletePermission] = useDeletePermissionMutation();
  const [isLoadingTable, setIsLoadingTable] = useState(true);


  const denseHeight = 40;

  useEffect(() => {
    setDense(true);
    if (currentData?.content)
      setIsLoadingTable(false);
  }, [setDense, currentData, isLoading]);


  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };
  const handleDeleteRow = async (id: string)  => {
      try {
          await deletePermission(parseInt(id, 10)).unwrap();
          setSelected([]);
          enqueueSnackbar("Apagado com sucesso!")
      } catch (e) {
          enqueueSnackbar(e.data.message, { variant: "error"})
      }
  };

  const handleDeleteRows = (selectedRows: string[]) => {
    //
  };


  const handleResetFilter = () => {
    setFilterName('');
    setInitialState({size: rowsPerPage, page: 0, term: ''});
  };

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

  usePageHeader({
    title: 'Lista de permissões',
    actions: (
      <Button
        onClick={() => handleOpen()}
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

  const changePage = (event: unknown, newPage: number) => {
    setIsLoadingTable(true);
    onChangePage(event, newPage);
    setInitialState({page: newPage, size: rowsPerPage});
  }

  const changeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeRowsPerPage(event);
    setInitialState({page: 0, size: parseInt(event.target.value, 10)});
  }

  return <>
    <Helmet>
      <title>Lista de permissões</title>
    </Helmet>

    <Container maxWidth={themeStretch ? false : 'lg'}>
      <Card>
        { isLoadingTable ? <LoadingScreen /> : <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            numSelected={selected.length}
            rowCount={currentData?.content?.length}
            onSelectAllRows={(checked) =>
              onSelectAllRows(
                checked,
                currentData?.content?.map((row) => `${row.id}`) || ['']
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
            <Table size='small' sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={currentData?.content?.length}
                onSort={onSort}
              />

              { isLoading  ? [...Array(rowsPerPage)] : <TableBody>
                {currentData?.content?.map((row, index) => row ? <PermissionTableRow
                      key={row.id}
                      row={row}
                      selected={selected.includes(`${row.id}`)}
                      onSelectRow={() => onSelectRow(`${row.id}`)}
                      onDeleteRow={() => handleDeleteRow(`${row.id}`)}
                    />
                  : <TableSkeleton key={index} sx={{ height: denseHeight }} />)}

                <TableNoData notFound={notFound} />
                <TableEmptyRows
                  emptyRows={emptyRows(page, rowsPerPage, 5)}
                />
              </TableBody>}
            </Table>
          </Scrollbar>
        </TableContainer>}

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
      <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description"
      >
          <Box sx={{ ...style }}>
              <PermissionNewEditForm currentPermission={currentPermission} closeModal={handleClose} />
          </Box>
      </Modal>
  </>;
}
