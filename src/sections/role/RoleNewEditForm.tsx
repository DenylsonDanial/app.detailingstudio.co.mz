import * as Yup from 'yup';
import React, {ChangeEvent, useEffect, useMemo, useState} from 'react';
// form
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
// @mui
import {LoadingButton} from '@mui/lab';
import {Box, Card, CardContent, CardHeader, Checkbox, FormControlLabel, Grid, Stack} from '@mui/material';
// utils
// components
import {useSnackbar} from 'notistack';
import FormProvider, {RHFTextField,} from '../../components/hook-form';
import {IRoleCreate} from "../../types/role";
import {useSaveRoleMutation, useUpdateRoleMutation} from "../../redux/services/roleService";
import {useGetPermissionsQuery} from "../../redux/services/permissionService";
import {IPermission} from "../../types/permission";
import Typography from '@mui/material/Typography';

interface FormValuesProps extends IRoleCreate {
}

type Props = {
    currentRole?: IRoleCreate,
    isEdit?: boolean;
};

const initialState : IPermission[] = [{id: 0, name: '', displayName: '', contextPath: '', bundler: ''}]

export default function RoleNewEditForm({isEdit = false, currentRole}: Props) {


    const [saveRole] = useSaveRoleMutation();
    const [updateRole] = useUpdateRoleMutation();
    const { currentData : permissionList, isLoading } = useGetPermissionsQuery(initialState);

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
    const [selectAllRoles, setSelectAllRoles] = useState<boolean>(false)
    const [permissionsListGrouped, setPermissionsListGrouped] = useState<{   bundler: string;   permissions: IPermission[] | undefined; }[]>([])

    const {enqueueSnackbar} = useSnackbar();

    const NewRoleSchema = Yup.object().shape({
        name: Yup.string().required('O nome é obrigatório.'),
        displayName: Yup.string().required('Este campo é obrigatório'),
    });

    const defaultValues = useMemo(
        () => ({
            id: currentRole?.id,
            name: currentRole?.name || '',
            displayName: currentRole?.displayName || '',
            permissions: currentRole?.permissions  || []
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentRole]
    );

    const methods = useForm({
        resolver: yupResolver(NewRoleSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    const handleSinglePermissionSelect = (event : ChangeEvent<HTMLInputElement>, id : number | undefined) : void => {
        if (id)
            if (!selectedPermissions.includes(id)) {
                setSelectedPermissions((prevData) => [...prevData, id]);
            } else {
                setSelectedPermissions((prevSelected) =>
                    prevSelected.filter((idPrev) => id !== idPrev)
                );
            }
    }

    const handleSelectAllRoles = (event : ChangeEvent<HTMLInputElement>) => {
        setSelectAllRoles(event.target.checked)
        const selectedPerms : number[] = [];
        if (permissionList)
            permissionList.forEach((role : IPermission) => {
                if (role.id) selectedPerms.push(role.id)
            })
        setSelectedPermissions(event.target.checked ? selectedPerms : [])
    }

    const handleSelectAllGroup = (event : ChangeEvent<HTMLInputElement>, bundler : string) => {
        const selectedPerms : number[] = [...selectedPermissions];
        if (event.target.checked) {
            if (permissionList)
                permissionList.forEach((permission : IPermission) => {
                    // implement a logic to make sure there no repeat values in selected permissions
                    if (permission.id && permission.bundler === bundler)
                        if (!selectedPerms.includes(permission.id))
                            selectedPerms.push(permission.id)
                })
            setSelectedPermissions(selectedPerms);
        } else {
            // selected permissions must not contain the deselected bundler
            if (permissionList)
                permissionList.forEach((permission : IPermission) => {
                    if (permission.id && permission.bundler === bundler)
                        selectedPerms.splice(selectedPerms.indexOf(permission.id), 1)
                })
            setSelectedPermissions(selectedPerms);
        }
    }

    useEffect(() => {
        // implement a logic to list the permissions with checkboxes grouped by bundler
        if (!isLoading) {
            // get bundler distinct
            const groupDistinct = permissionList?.map(p => p.bundler)
              .filter((value, index, self) => self.indexOf(value) === index);
            if (groupDistinct) {
                // compose key values for each bundler
                const groupPermissions = groupDistinct.map(bundler => {
                    const permissions = permissionList?.filter(p => p.bundler === bundler);
                    return {bundler, permissions};
                });
                setPermissionsListGrouped(groupPermissions);
            }
        }
        if (isEdit && currentRole) {
            reset(defaultValues);
            setSelectedPermissions(currentRole?.permissions || []);
            setSelectAllRoles(currentRole?.permissions?.length === permissionList?.length);
        }
        if (!isEdit) {
            reset(defaultValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, currentRole, isLoading]);

    const onSubmit = async (data: FormValuesProps | IRoleCreate) => {
        if (selectedPermissions.length === 0) {
            enqueueSnackbar("Seleccionae pelo menos uma permissão", {variant: "error"});
            return;
        }
        data.permissions = selectedPermissions;
        try {
            if (!isEdit) {
                await saveRole(data).unwrap();
                setSelectAllRoles(false);
                setSelectedPermissions([]);
                reset();
                enqueueSnackbar('Criado com sucesso!');
            } else {
                data.id = currentRole?.id || 0;
                await updateRole(data).unwrap();
                reset();
                enqueueSnackbar('Actualizado com sucesso!');
            }

        } catch (error) {
            enqueueSnackbar(error.status === 500 ?
                "Ocorreu um erro no sistema" :
                "Verifique os dados introduzidos.",
                {variant: "error"});
        }
    };

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{p: 2, gap: 2}} >
                        <Stack spacing={2}>
                            <RHFTextField size="small" name="name" label="Nome/Permissão"/>
                            <RHFTextField size="small" name="displayName" label="Nome a apresentar"/>
                        </Stack>
                        <Stack mt={2} alignItems="flex-end" justifyContent="end" gap={1} display="flex" flexDirection="row" >
                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                {!isEdit ? 'Gravar' : 'Actualizar'}
                            </LoadingButton>
                        </Stack>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardHeader title="Permissões" />
                        <CardContent >
                            <FormControlLabel
                                checked={selectAllRoles}
                                control={
                                    <Checkbox
                                        onChange={(event : ChangeEvent<HTMLInputElement>) => handleSelectAllRoles(event)}
                                    />} label="Seleccionar todas" />
                            <Box
                                component="div"
                                sx={{
                                    maxHeight: '300px', borderRadius: '8px', overflowY: 'auto',
                                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                                }}
                                display='flex'
                                flexDirection='row'
                                flexWrap='wrap'
                            >
                                {permissionsListGrouped?.map((bundler, i) => {
                                    return (
                                        <Box key={i} sx={{width: '100%'}}>
                                            <Typography sx={{ fontSize: 12 }}>
                                                {bundler.bundler}
                                            </Typography>
                                            <FormControlLabel
                                              checked={selectedPermissions.filter((role) => bundler.permissions?.map(p => p.id).includes(role)).length === bundler.permissions?.length}
                                              control={
                                                  <Checkbox
                                                    onChange={(event : ChangeEvent<HTMLInputElement>) => handleSelectAllGroup(event, bundler.bundler || '')}
                                                  />} label="Seleccionar todas" />
                                            <Box
                                                component="div"
                                                display='flex'
                                                flexDirection='row'
                                                flexWrap='wrap'
                                                sx={{borderBottom: '1px #ccc solid', padding: 1, marginBottom: 1}}
                                            >
                                                {bundler.permissions?.map((p, i) => {
                                                    let isRoleSelected = false;
                                                    if(p.id)
                                                        isRoleSelected = selectedPermissions.includes(p.id)
                                                    return <FormControlLabel
                                                        key={i}
                                                        checked={isRoleSelected}
                                                        value={isRoleSelected}
                                                        control={<Checkbox
                                                            onChange={(event : ChangeEvent<HTMLInputElement>) => handleSinglePermissionSelect(event, p.id)}
                                                        />}
                                                        label={p.displayName}

                                                    />
                                                })}
                                            </Box>
                                        </Box>
                                    )
                                }
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </FormProvider>
    );
}
