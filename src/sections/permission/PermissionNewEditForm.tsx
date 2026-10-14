import * as Yup from 'yup';
import {useEffect, useMemo} from 'react';
// form
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
// @mui
import {LoadingButton} from '@mui/lab';
import {Button, Stack} from '@mui/material';
// utils
// components
import {useSnackbar} from 'notistack';
import FormProvider, {RHFTextField,} from '../../components/hook-form';
import {IPermission} from "../../types/permission";
import {useSavePermissionMutation, useUpdatePermissionMutation} from "../../redux/services/permissionService";


type Props = {
    currentPermission: IPermission,
    closeModal: () => void,
    isEdit?: boolean;
};

export default function PermissionNewEditForm({isEdit = false, closeModal, currentPermission}: Props) {


    const [ savePermission ] = useSavePermissionMutation();
    const [ updatePermission ] = useUpdatePermissionMutation();

    const {enqueueSnackbar} = useSnackbar();

    const NewPermissionSchema = Yup.object().shape({
        name: Yup.string().required('O nome é obrigatório.'),
        displayName: Yup.string().required('Este campo é obrigatório'),
        contextPath: Yup.string().required('Este campo é obrigatório'),
        bundler: Yup.string().required('Este campo é obrigatório'),
    });

    const defaultValues : IPermission = useMemo(
        () => ({
            name: currentPermission?.name || '',
            displayName: currentPermission?.displayName || '',
            contextPath: currentPermission?.contextPath || '',
            bundler: currentPermission?.bundler || ''
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentPermission]
    );

    const methods = useForm<IPermission>({
        resolver: yupResolver(NewPermissionSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    useEffect(() => {
        if (isEdit && currentPermission) {
            reset(defaultValues);
        }
        if (!isEdit) {
            reset(defaultValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, currentPermission]);

    const onSubmit = async (data: IPermission) => {
        try {
            if (!isEdit) {
                await savePermission(data)
                reset();
                enqueueSnackbar('Criado com sucesso!');
            } else {
                data.id = currentPermission.id;
                await updatePermission(data);
                reset();
                enqueueSnackbar('Actualizado com sucesso!');
                closeModal();
            }

        } catch (error) {
            enqueueSnackbar(error.message, {variant: "error"});
        }
    };

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{mt: 3}}>
                <RHFTextField size="small" name="name" label="Nome/Permissão"/>
                <RHFTextField size="small" name="displayName" label="Nome a apresentar"/>
                <RHFTextField size="small" name="contextPath" label="Url path"/>
                <RHFTextField size="small" name="bundler" label="Grupo"/>
            </Stack>

            <Stack alignItems="flex-end" justifyContent="end" gap={1} display="flex" flexDirection="row" sx={{mt: 3}}>
                <Button variant="outlined" color="inherit" onClick={closeModal}>
                    Cancelar
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    {!isEdit ? 'Gravar' : 'Actualizar'}
                </LoadingButton>
            </Stack>
        </FormProvider>
    );
}
