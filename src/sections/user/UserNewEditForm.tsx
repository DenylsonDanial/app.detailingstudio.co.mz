import * as Yup from 'yup';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
// utils
// routes
// types
import { IUserCreate } from 'src/types/user';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Theme, useTheme } from '@mui/material/styles';
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import InputAdornment from '@mui/material/InputAdornment';
import { useGetRolesQuery } from '../../redux/services/roleService';
import { initialRolePageData, IRole, IRolePage } from '../../types/role';
import { useSaveUserMutation, useUpdateUserMutation } from '../../redux/services/userService';
import { paths } from '../../routes/paths';
import Iconify from '../../components/iconify';
import { useBoolean } from '../../hooks/use-boolean';
import { ITenant, ITenantPage } from '../../types/tenant';
import { useGetCompaniesQuery } from '../../redux/services/companyService';
import { Roles } from '../../utils/authorities';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserCreate,
  isEdit?: boolean;
};

const initialStateRole: IRolePage = initialRolePageData;

export default function UserNewEditForm({ isEdit, currentUser }: Props) {

  const { currentData: rolesList } = useGetRolesQuery(initialStateRole);
  const [initialState] = useState<ITenantPage>({size: 1000, page: 0});

  const { currentData : tenantsList } = useGetCompaniesQuery(initialState)


  const [saveUser] = useSaveUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const password = useBoolean();
  useBoolean();

  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {
    const rList: string[] = [];
    currentUser?.rolesIds?.forEach(item => {
      rList.push(item.toString());
    });
    setRoles(rList);

    const tList: string[] = [];
    currentUser?.locationsIds?.forEach(item => {
      tList.push(item.toString());
    });
    setTenants(tList);
  }, [currentUser]);

  const NewUserSchema: any = Yup.object().shape({
    username: Yup.string().required('Nome de utilizador é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email deve ser válido'),
    firstName: Yup.string().required('Primeiro nome é obrigatório'),
    surname: Yup.string().required('O apelido é obrigatório'),
    status: Yup.string(),
    roles: Yup.string(),
    isVerified: Yup.boolean(),
    password: isEdit
      ? Yup.string()
      : Yup.string().required('A palavra-passe é obrigatória'),
    passwordConfirm: Yup.string().when('password', {
      is: (value: string) => !!value,
      then: (schema) =>
        schema
          .required('Confirme a palavra-passe')
          .oneOf([Yup.ref('password')], 'As palavras-passe não coincidem'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const navigate = useNavigate();
  const defaultValues = useMemo(
    () => ({
      username: currentUser?.username || '',
      email: currentUser?.email || '',
      firstName: currentUser?.firstName || '',
      surname: currentUser?.surname || '',
      isVerified: currentUser?.isVerified || true,
      status: '',
      password: '',
      passwordConfirm: '',
    }),
    [currentUser],
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const missingRoles = roles.length < 1;
    const missingTenants = tenants.length < 1;

    setRolesError(missingRoles);
    setTenantsError(missingTenants);

    if (missingRoles) {
      enqueueSnackbar('Seleccione pelo menos 1 cargo.!', { variant: 'error' });
      return;
    }
    if (missingTenants) {
      enqueueSnackbar('Seleccione pelo menos uma empresa.!', { variant: 'error' });
      return;
    }
    const rolesIds: number[] = [];
    roles?.forEach((item: string) => rolesIds.push(parseInt(item, 10)));

    const tenantsIds: number[] = [];
    tenants?.forEach((item: string) => tenantsIds.push(parseInt(item, 10)));

    try {
      if (!isEdit) {
        await saveUser({ ...data, rolesIds, locationsIds: tenantsIds }).unwrap();
        setRoles([]);
        setTenants([]);
        setRolesError(false);
        setTenantsError(false);
        reset();
        enqueueSnackbar('Criado com sucesso!');
      } else {
        const payload = {
          ...data,
          rolesIds,
          locationsIds: tenantsIds,
          // Nao enviar palavra-passe vazia na edicao (mantem a actual no servidor).
          ...(data.password ? {} : { password: undefined, passwordConfirm: undefined }),
        };
        await updateUser({
          data: payload,
          id: currentUser!.id!,
          isAccessUpdate: false,
        }).unwrap();
        enqueueSnackbar('Actualizado com sucesso!');
        navigate(paths.dashboard.user.list);
      }

    } catch (error) {
      if (error?.data.length > 0) {
        error.data.forEach((item: string) => enqueueSnackbar(item, { variant: 'error' }));
      } else if (error?.status === 400) {
        enqueueSnackbar(error?.data?.message || 'Verifique os dados introduzidos.', { variant: 'error' });
      } else {
        enqueueSnackbar(error.status === 500 ?
            'Ocorreu um erro inesperado' :
            'Verifique os dados introduzidos.',
          { variant: 'error' });
      }
    }
  });

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      },
    },
  };


  function getStyles(name: string, selectedRoles: readonly string[], currentTheme: Theme) {
    return {
      fontWeight:
        selectedRoles.indexOf(name) === -1
          ? currentTheme.typography.fontWeightRegular
          : currentTheme.typography.fontWeightMedium,
    };
  }

  function getTenantStyles(name: string | undefined, selectedTenants: readonly string[], currentTheme: Theme) {
    if (name === undefined || selectedTenants === undefined) {
      return {};
    }
    return {
      fontWeight:
        selectedTenants.indexOf(name) === -1
          ? currentTheme.typography.fontWeightRegular
          : currentTheme.typography.fontWeightMedium,
    };
  }

  const theme = useTheme();
  const [roles, setRoles] = useState<string[]>([]);
  const [tenants, setTenants] = useState<string[]>([]);
  const [rolesError, setRolesError] = useState(false);
  const [tenantsError, setTenantsError] = useState(false);

  const handleRoleChange = (event: SelectChangeEvent<typeof roles>) => {
    const {
      target: { value },
    } = event;

    const listString: string[] = [];
    const selecteds = typeof value === 'string' ? value.split(',') : value;
    selecteds.forEach((item: string) => listString.push(item.toString()));

    const finalList = listString.filter((item, _, array) => array.indexOf(item) === array.lastIndexOf(item));

    setRoles(finalList);
    setRolesError(finalList.length < 1);
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
    setTenantsError(finalList.length < 1);
  };

  const passwordHelperText = isEdit
    ? 'Opcional — deixe em branco para manter a actual'
    : undefined;

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" paragraph>
              Dados do utilizador
            </Typography>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="firstName" label="Primeiro nome" required />
              <RHFTextField name="surname" label="Apelido" required />
              <RHFTextField name="email" label="Email" required />
              <RHFTextField name="username" label="Nome de utilizador" required />

              <FormControl fullWidth required error={tenantsError}>
                <InputLabel id="tenants-multiple-select">Empresas permitidas</InputLabel>
                <Select
                  labelId="tenants-multiple-select"
                  id="tenants-multiple"
                  multiple
                  value={tenants}
                  onChange={handleTenantChange}
                  input={<OutlinedInput id="select-multiple-tenants" label="Empresas permitidas" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((item: string, i: number) => {
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
                      style={getTenantStyles(item.tenantName, tenants, theme)}
                    >
                      {item.tenantName}
                    </MenuItem>
                  ))}
                </Select>
                {tenantsError && (
                  <FormHelperText>Seleccione pelo menos uma empresa</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth required error={rolesError}>
                <InputLabel id="roles-multiple-select">Cargos</InputLabel>
                <Select
                  labelId="roles-multiple-select"
                  id="roles-multiple"
                  multiple
                  value={roles}
                  onChange={handleRoleChange}
                  input={<OutlinedInput id="select-multiple-roles" label="Cargos" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((item: string, i: number) => {
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
                {rolesError && (
                  <FormHelperText>Seleccione pelo menos 1 cargo</FormHelperText>
                )}
              </FormControl>
            </Box>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" paragraph>
              Acessos
            </Typography>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name="password"
                label="Palavra-passe"
                required={!isEdit}
                helperText={passwordHelperText}
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField
                name="passwordConfirm"
                label="Confirmar palavra-passe"
                required={!isEdit}
                helperText={passwordHelperText}
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Stack alignItems="flex-end">
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentUser ? 'Gravar' : 'Actualizar'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
