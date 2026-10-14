import {Helmet} from 'react-helmet-async';
import {useEffect, useState} from 'react';
// @mui
import {
    Button,
    Card,
    Container,
    IconButton,
    Table,
    TableBody,
    TableContainer,
    Tooltip
} from '@mui/material';
// routes
import { useSnackbar } from 'src/components/snackbar';
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
// @types
import {initialRolePageData, IRole, IRolePage} from '../../types/role';
// _mock_
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/custom-dialog/confirm-dialog';
import {useSettingsContext} from '../../components/settings';
import {
    emptyRows,
    TableEmptyRows,
    TableHeadCustom,
    TablePaginationCustom,
    TableSelectedAction,
    TableSkeleton,
    useTable,
} from '../../components/table';
// sections
import {RoleTableRow} from '../../sections/role/list';
import {useDeleteRoleMutation, useGetRolesQuery} from "../../redux/services/roleService";
import {setRoles} from '../../redux/slices/roleSlice';
import {paths} from "../../routes/paths";
import { usePageHeader } from '../../layouts/dashboard/page-header-context';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    {id: 'name', label: 'Descrição', align: 'left'},
    {id: ''},
];

// ----------------------------------------------------------------------

export default function Rolelist() {
    const {
        page,
        order,
        orderBy,
        rowsPerPage,
        setDense,
        selected,
        setSelected,
        onSelectRow,
        onSelectAllRows,
        //
        onSort,
        onChangeDense,
        onChangePage,
        onChangeRowsPerPage,
    } = useTable({defaultRowsPerPage: 25});

    const initialState: IRolePage = initialRolePageData;

    const {themeStretch} = useSettingsContext();

    const [tableData, setTableData] = useState<IRolePage>(initialState);

    const [openConfirm, setOpenConfirm] = useState(false);

    const [isLoadingTable, setIsLoadingTable] = useState(false);

    const [dataFiltered, setDataFiltered] = useState<IRole[]>([{id: 1, name: '', displayName: '', permissions: []}]);

    const {enqueueSnackbar} = useSnackbar();

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const {isLoading, currentData} = useGetRolesQuery(tableData);

    const [deleteRole] = useDeleteRoleMutation();

    useEffect(() => {
        setIsLoadingTable(true)
        setDense(true);
        if (!isLoading) {
            setDataFiltered(currentData?.content || []);
            dispatch( setRoles(currentData?.content || []) );
            setIsLoadingTable(false)
        }
    }, [setDense, currentData, isLoading, order, orderBy,dispatch]);


    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleDeleteRow = async (id: string) => {
        try {
            await deleteRole(parseInt(id, 10)).unwrap();
            setSelected([]);
            enqueueSnackbar("Apagado com sucesso!")
        } catch (e) {
            enqueueSnackbar(e.data.message, {variant: "error"})
        }
    };

    const changePage = (event: unknown, newPage: number) => {
        setIsLoadingTable(true)
        setTableData({...initialState, number: newPage, size: rowsPerPage});
        onChangePage(event, newPage);
    }

    const handleNewRole = () => {
        navigate(paths.dashboard.role.new);
    };

    usePageHeader({
        title: 'Lista de cargos',
        actions: (
            <Button
                onClick={handleNewRole}
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill"/>}
            >
                Adicionar
            </Button>
        ),
    });

    return (
        <>
            <Helmet>
                <title>Lista de cargos</title>
            </Helmet>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <Card>
                    <TableContainer sx={{position: 'relative', overflow: 'unset'}}>
                        <TableSelectedAction
                            numSelected={selected.length}
                            rowCount={tableData?.content.length}
                            onSelectAllRows={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData?.content.map((row) => row.id.toString())
                                )
                            }
                            action={
                                <Tooltip title="Delete">
                                    <IconButton color="primary" onClick={handleOpenConfirm}>
                                        <Iconify icon="eva:trash-2-outline"/>
                                    </IconButton>
                                </Tooltip>
                            }
                        />

                        <Scrollbar>
                            <Table size='small' sx={{minWidth: 800}}>
                                <TableHeadCustom
                                    order={order}
                                    orderBy={orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={tableData?.numberOfElements || 0}
                                    numSelected={selected.length}
                                    onSort={onSort}
                                    onSelectAllRows={(checked) =>
                                        onSelectAllRows(
                                            checked,
                                            tableData?.content.map((row) => row.id.toString())
                                        )
                                    }
                                />

                                <TableBody>
                                    {(isLoadingTable ? [...Array(rowsPerPage)] : dataFiltered)
                                        .map((row, index) => row ? (
                                                <RoleTableRow
                                                    key={row.id}
                                                    row={row}
                                                    selected={selected.includes(row.id)}
                                                    onSelectRow={() => onSelectRow(row.id)}
                                                    onDeleteRow={() => handleDeleteRow(row.id)}
                                                />)
                                            : (<TableSkeleton key={index} sx={{height: 40}}/>)
                                        )}

                                    <TableEmptyRows
                                        emptyRows={emptyRows(page, rowsPerPage, tableData?.content.length)}
                                    />

                                </TableBody>
                            </Table>
                        </Scrollbar>
                    </TableContainer>

                    <TablePaginationCustom
                        count={-1}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={changePage}
                        onRowsPerPageChange={onChangeRowsPerPage}
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
