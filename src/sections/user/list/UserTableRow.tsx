import React, { useEffect, useMemo, useState } from 'react';
// @mui
import {
  Box,
  Button,
  Checkbox,
  Chip, FormControl,
  IconButton, InputLabel,
  ListItemText,
  MenuItem,
  Modal, OutlinedInput, Select, SelectChangeEvent, Stack,
  TableCell,
  TableRow,
} from '@mui/material';
// @types
import {useNavigate} from "react-router-dom";
import { useForm } from 'react-hook-form';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Theme, useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import {IUserCreate, IUserRow} from '../../../types/user';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
import ConfirmDialog from '../../../components/custom-dialog/confirm-dialog';
import {paths} from "../../../routes/paths";
import Label from "../../../components/label";
import {isAdmin} from "../../../auth/context/jwt/utils";
import { Roles } from '../../../utils/authorities';
import { initialRolePageData, IRole, IRolePage } from '../../../types/role';
import { ITenant, ITenantPage } from '../../../types/tenant';
import { useGetRolesQuery } from '../../../redux/services/roleService';
import { useGetCompaniesQuery } from '../../../redux/services/companyService';
import { enqueueSnackbar } from 'notistack';
import { useUpdateUserMutation } from '../../../redux/services/userService';
// ----------------------------------------------------------------------

type Props = {
  row: IUserRow;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
}: Props) {

  const initialStateRole: IRolePage = initialRolePageData;

  const [openConfirm, setOpenConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const { currentData: rolesList } = useGetRolesQuery(initialStateRole);
  const [initialState] = useState<ITenantPage>({size: 1000, page: 0});
  const [roles, setRoles] = useState<string[]>([]);
  const [tenants, setTenants] = useState<string[]>([]);
  const [updateUser] = useUpdateUserMutation();

  const { currentData : tenantsList } = useGetCompaniesQuery(initialState)


  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const rList: string[] = [];
    row?.roles?.forEach(role => {
      rList.push(role.id.toString());
    });
    setRoles(rList);

    const tList: string[] = [];
    row?.businessLocations?.forEach(bl => {
      if (bl.id) {
        tList.push(bl.id.toString());
      }
    });
    setTenants(tList);
  }, [row]);

  const handleRoleChange = (event: SelectChangeEvent<typeof roles>) => {
    const {
      target: { value },
    } = event;

    const listString: string[] = [];
    const selecteds = typeof value === 'string' ? value.split(',') : value;
    selecteds.forEach((item: string) => listString.push(item.toString()));

    const finalList = listString.filter((item, _, array) => array.indexOf(item) === array.lastIndexOf(item));

    setRoles(finalList);
  };

  const handleTenantChange = (event: SelectChangeEvent<typeof tenants>) => {
    const {
      target: { value },
    } = event;

    const listString: string[] = [];
    const selecteds = typeof value === 'string' ? value.split(',') : value;
    selecteds.forEach((item: string) => listString.push(item.toString()));

    const finalList = listString.filter((item, _, array) => array.indexOf(item) === array.lastIndexOf(item));

    setTenants(finalList);
  };
  
  const navigate = useNavigate();

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleEditRow = () => {
    navigate(paths.dashboard.user.edit(row.id));
  };

  const handleOpenAccessModal = () => {
    setOpen(true);
  };
  const handleCloseAccessModal = () => {
    setOpen(false);
  };

  const theme = useTheme();

  const userStatusFormat = (usertStatus : string) => usertStatus === 'ACTIVE' ? 'Activa' : 'Suspensa';

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
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const defaultValues = useMemo(
    () => ({}),
    [],
  );

  const methods = useForm();
  const {
    reset,
    handleSubmit,
    formState: {isSubmitting},
  } = methods;

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function getStyles(name: string, roles: readonly string[], theme: Theme) {
    return {
      fontWeight:
        roles.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function getTenantStyles(name: string | undefined, tenantsIn: readonly string[], theme: Theme) {
    if (name === undefined || tenantsIn === undefined) {
      return {};
    }
    return {
      fontWeight:
        tenantsIn.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }


  const onSubmit = handleSubmit(async (data) => {
    const rolesIds: number[] = [];
    roles?.forEach((item: string) => rolesIds.push(parseInt(item, 10)));

    const tenantsIds: number[] = [];
    tenants?.forEach((item: string) => tenantsIds.push(parseInt(item, 10)));

    try {
        const payload: IUserCreate = {
          ...row,
          firstName: '',
          surname: '',
          rolesIds,
          locationsIds: tenantsIds,
        };
        await updateUser({ data: payload, id: row?.id, isAccessUpdate: true }).unwrap();
        handleCloseAccessModal();
        enqueueSnackbar('Actualizado com sucesso!');
    } catch (error) {
      if (error?.data.length > 0) {
        error.data.forEach((item: string) => enqueueSnackbar(item, { variant: 'error' }));
      } else if (error?.status === 400) {
        enqueueSnackbar(error?.data?.message || 'Verifique os dados introduzidos.', { variant: 'error' });
      } else {
        enqueueSnackbar(error.status === 500 ? 'Ocorreu um erro inesperado' : 'Verifique os dados introduzidos.',
          { variant: 'error' });
      }
    }
  });

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemText
              primary={row?.name}
              secondary=''
              primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>
        <TableCell align="left">
          {row?.roles.map(item => <Chip size='small' key={item.id} label={item.displayName} variant="outlined" />)}
        </TableCell>
        <TableCell align="left">
          {row?.username}
        </TableCell>
        <TableCell align="left">
          <Label
              variant="soft"
              color={
                  (row?.userStatus === 'ACTIVE' && 'success') ||
                  (row?.userStatus === 'SUSPENDED' && 'warning') ||
                  'default'
              }
          >
            {userStatusFormat(row?.userStatus)}
          </Label>

        </TableCell>
        <TableCell align="left">
          {row?.email}
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {isAdmin() && <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Remover
        </MenuItem>}

        <MenuItem
          onClick={() => {
            handleEditRow();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Editar
        </MenuItem>

        <MenuItem
          onClick={handleOpenAccessModal}
        >
          <Iconify icon="eva:shield-outline" />
          Modificar acesso
        </MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Remover"
        content="Tem certeza que deseja remover?"
        action={
          <Button variant="contained" color="error" onClick={() => {
              setOpenConfirm(false)
              onDeleteRow()
            }
          }>
            Remover
          </Button>
        }
      />

      <Modal
        open={open}
        onClose={handleCloseAccessModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >

        <Box sx={{ ...style }}>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <FormControl>
              <InputLabel id="tenants-multiple-select">Empresas permitidas</InputLabel>
              <Select
                labelId="tenants-multiple-select"
                id="tenants-multiple"
                multiple
                value={tenants}
                onChange={handleTenantChange}
                input={<OutlinedInput id="select-multiple-tenants" label="Empresa permitidas" />}
                renderValue={(selectedTennat) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedTennat.map((item: string, i: number) => {
                      const foundTenant = tenantsList?.content?.find((obj) => obj.id === +item);
                      return (<Chip key={i} label={foundTenant?.tenantName} />);
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {tenantsList?.content?.map((item: ITenant) => (
                  <MenuItem
                    key={item.id}
                    value={String(item.id)}
                    style={getTenantStyles(item.tenantName, roles, theme)}
                  >
                    {item.tenantName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="roles-multiple-select">Cargos</InputLabel>
              <Select
                labelId="roles-multiple-select"
                id="roles-multiple"
                multiple
                value={roles}
                onChange={handleRoleChange}
                input={<OutlinedInput id="select-multiple-roles" label="Cargos" />}
                renderValue={(selectedRole) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedRole.map((item: string, i: number) => {
                      const foundRole = rolesList?.content?.find((obj) => obj.id === +item);
                      return (<Chip key={i} label={foundRole?.displayName} />);
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {rolesList?.content?.filter(item => item.name !== Roles.SA).map((item: IRole) => (
                  <MenuItem
                    key={item.id}
                    value={String(item.id)}
                    style={getStyles(item.displayName, roles, theme)}
                  >
                    {item.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          <Stack alignItems="flex-end" justifyContent="end" gap={1} display="flex" flexDirection="row" sx={{mt: 3}}>
            <Button variant="outlined" color="inherit" onClick={handleCloseAccessModal}>
              Fechar
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Guardar
            </LoadingButton>
          </Stack>
          </FormProvider>
        </Box>
      </Modal>

    </>
  );
}
