import { useFormContext } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Theme, useTheme } from '@mui/material/styles';
import { initialRolePageData, IRole, IRolePage } from '../../../types/role';
import Iconify from '../../../components/iconify';
import { useBoolean } from '../../../hooks/use-boolean';
import { useGetRolesQuery } from '../../../redux/services/roleService';
import { RHFSelect, RHFTextField } from '../../../components/hook-form';
import { useSettingsContext } from '../../../components/settings';
import { IUserPage, IUserRow } from '../../../types/user';
import { useGetUsersQuery } from '../../../redux/services/userService';
import { Roles } from '../../../utils/authorities';

const initialStateRole: IRolePage = initialRolePageData;

export const UserFields: React.FC = () => {
  const { currentData: rolesList } = useGetRolesQuery(initialStateRole);
  const [initialState] = useState<IUserPage>({ size: 1000, page: 0 });
  const { currentData } = useGetUsersQuery(initialState);
  const [createNewUser, setCreateNewUser] = useState<boolean>(false);
  const [roles, setRoles] = useState<string[]>([]);
  const theme = useTheme();
  const { register, setValue, getValues } = useFormContext(); // Access methods from FormProvider
  const password = useBoolean();
  const { themeStretch } = useSettingsContext();

  useEffect(() => {
    const userId = getValues('userId' as string);
    setCreateNewUser(!userId);
    const rolesIds = getValues('user.rolesIds' as any);
    if (rolesIds) {
      setRoles(rolesIds);
    }
    // Le os valores iniciais do formulario uma unica vez, ao montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event: SelectChangeEvent<typeof roles>) => {
    const {
      target: { value },
    } = event;
    setRoles(typeof value === 'string' ? value.split(',') : value);
    setValue('user.rolesIds', value);
  };

  function getStyles(name: string, businessLocations: readonly string[], themeNew: Theme) {
    return {
      fontWeight:
        businessLocations.indexOf(name) === -1
          ? themeNew.typography.fontWeightRegular
          : themeNew.typography.fontWeightMedium,
    };
  }

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      },
    },
  };

  return (
    <Stack sx={{ display: 'flex', alignSelf: 'stretch', width: '100%', gap: 2 }}>
      <Stack sx={{ display: 'flex', flexDirection: 'row', flex: 1, gap: 2 }}>
        <Stack>
          <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" paragraph>
              Criar/Seleccionar utilizador?
            </Typography>
            {!createNewUser && (
              <RHFSelect name="userId" size="small" label="Utilizador">
                {currentData?.content?.map((user: IUserRow) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}
            <Button
              onClick={() => {
                if (!createNewUser) setValue('userId', null);
                setCreateNewUser((prevState) => !prevState);
              }}
              variant="contained"
              startIcon={
                createNewUser ? (
                  <Iconify icon="eva:search-outline" />
                ) : (
                  <Iconify icon="eva:plus-fill" />
                )
              }
            >
              {createNewUser ? 'Seleccionar utilizador' : 'Criar novo utilizador'}
            </Button>
          </Card>
        </Stack>
        {createNewUser && (
          <Stack sx={{ flexGrow: 1 }}>
            <Card sx={{ p: 2 }}>
              <Box
                rowGap={1}
                columnGap={1}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField size="small" name="user.firstName" label="Primeiro nome" />
                <RHFTextField size="small" name="user.surname" label="Apelido" />
                <RHFTextField size="small" name="user.email" label="Email" />

                <RHFTextField size="small" name="user.username" label="Nome de utilizador" />
              </Box>
            </Card>
          </Stack>
        )}
      </Stack>
      {createNewUser && (
        <Stack>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" paragraph>
              Acessos
            </Typography>
            <Box
              rowGap={1}
              columnGap={1}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <FormControl>
                <InputLabel id="roles-multiple-select">Cargos</InputLabel>
                <Select
                  labelId="roles-multiple-select"
                  id="roles-multiple"
                  multiple
                  size="small"
                  name="user.rolesIds"
                  value={roles}
                  onChange={handleChange}
                  input={<OutlinedInput id="select-multiple-roles" label="Função" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((item: string, i: number) => {
                        const foundRole = rolesList?.content?.find((obj) => obj.id === +item);
                        return <Chip key={i} label={foundRole?.displayName} />;
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {rolesList?.content
                    ?.filter((item) => item.name !== Roles.SA)
                    .map((item: IRole) => (
                      <MenuItem
                        key={item.id}
                        value={item.id}
                        style={getStyles(item.displayName, roles, theme)}
                      >
                        {item.displayName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <RHFTextField
                name="user.password"
                size="small"
                label="Palavra-passe"
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField
                name="user.passwordConfirm"
                label="Confirmar palavra-passe"
                size="small"
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Card>
        </Stack>
      )}
    </Stack>
  );
};
