import * as Yup from 'yup';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, Stack } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import { enqueueSnackbar } from 'notistack';
import FormProvider, { RHFTextField, RHFUploadAvatar } from '../../../components/hook-form';
import { useGetBusinessMutation, useUpdateBusinessMutation } from '../../../redux/services/businessService';
import { IBusinessSetting } from '../../../types/businessSetting';
import { fData } from '../../../utils/format-number';
import { stripBase64Prefix } from '../../../utils/image-util';


export default function GeneralSetting() {

  const [currentBusiness, setCurrentBusiness] = useState<IBusinessSetting>({});
  const [fileName, setFileName] = useState<string | null>();

  const [ getBusiness  ] = useGetBusinessMutation();
  const [ updateBusiness ] = useUpdateBusinessMutation();

  const defaultValues  = useMemo(
    () => ({
      businessName: currentBusiness?.businessName || '',
      nuit: currentBusiness?.nuit || '',
      email: currentBusiness?.email || '',
      website: currentBusiness?.website || '',
      phone: currentBusiness?.phone || '',
      altPhone: currentBusiness?.altPhone || '',
      address: currentBusiness?.address || '',
      city: currentBusiness?.city || '',
      province: currentBusiness?.province || '',
      activitySector: currentBusiness?.activitySector || '',
      activityStart: currentBusiness?.activityStart || new Date(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentBusiness?.businessName, currentBusiness?.nuit]
  );

  const NewBusinessSettingSchema = Yup.object().shape({
    businessName: Yup.string().required('O nome é obrigatório.'),
    nuit: Yup.string(),
    email: Yup.string()
      .transform((value) => (value === '' ? undefined : value))
      .email('Email inválido.'),
    website: Yup.string(),
    phone: Yup.string(),
    altPhone: Yup.string(),
    address: Yup.string(),
    city: Yup.string(),
    province: Yup.string(),
    activitySector: Yup.string(),
  });

  const methods = useForm<any>({
    resolver: yupResolver(NewBusinessSettingSchema),
    defaultValues,
  });
  
  const {
    reset,
    handleSubmit,
    formState: {isSubmitting},
    setValue
  } = methods;

  const getCurrentBusiness = useCallback(async () => {
    const bS = await getBusiness().unwrap();
    reset({
      id: bS.id,
      businessName: bS.businessName || '',
      nuit: bS.nuit || '',
      email: bS.email || '',
      website: bS.website || '',
      phone: bS.phone || '',
      altPhone: bS.altPhone || '',
      address: bS.address || '',
      city: bS.city || '',
      province: bS.province || '',
      activitySector: bS.activitySector || '',
      activityStart: bS.activityStart ? new Date(bS.activityStart) : null,
      logo: bS.logo ? `data:image/png;base64,${bS.logo}` : null,
    });
    setCurrentBusiness({...bS});
  }, [getBusiness, reset]);

  useEffect(() => {
    getCurrentBusiness();
  }, [getCurrentBusiness]);


  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      setValue('logo', base64String, { shouldValidate: true });
    };
    setFileName(file.name);

    reader.readAsDataURL(file);
  }, [setValue]);


  const onSubmit = async (data: IBusinessSetting) => {
    try {

      await updateBusiness({
        ...currentBusiness,
        ...data,
        logo: stripBase64Prefix(data.logo || '') || '',
      }).unwrap()
      reset({...data});
      enqueueSnackbar('Actualizado com sucesso!');
    } catch (error) {
      if (error?.data?.length > 0) {
        error.data.forEach((item : string) => enqueueSnackbar(item, {variant: "error"}))
      } else if(error?.status === 400) {
        enqueueSnackbar(error?.data?.message || "Verifique os dados introduzidos.", {variant: "error"});
      } else {
        enqueueSnackbar(error.status === 500 ?
            "Ocorreu um erro inesperado" :
            "Verifique os dados introduzidos.",
          {variant: "error"});
      }
    }
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={1}>
        <Grid xs={12} md={3} item>
          <RHFUploadAvatar
            name="logo"
            fileName={fileName}
            maxSize={1000000}
            onDrop={handleDrop}
            helperText={
              <Typography
                variant="caption"
                sx={{
                  mt: 3,
                  mx: 'auto',
                  display: 'block',
                  textAlign: 'center',
                  color: 'text.disabled',
                }}
              >
                Permitidos *.jpeg, *.jpg, *.png, *.gif
                <br/> tamanho máximo {fData(1000000)}
              </Typography>
            }
          />
        </Grid>
        <Grid xs={12} md={5} item sx={{gap: 2, display: 'flex', flexDirection: 'column'}}>
          <RHFTextField required size="small" name="businessName" label="Nome da empresa"/>
          <RHFTextField size="small" name="nuit" label="NUIT"/>
          <RHFTextField size="small" name="email" label="Email institucional"/>
          <RHFTextField size="small" name="website" label="Website"/>
          <RHFTextField size="small" name="phone" label="Telefone"/>
          <RHFTextField size="small" name="altPhone" label="Telefone alternativo"/>
          <RHFTextField size="small" name="address" label="Morada"/>
          <Stack sx={{ display: 'flex', gap: 1, flexDirection: 'row'}}>
            <RHFTextField inputProps={{maxLength: 100}} name="province" size="small"
                          label="Província"/>
            <RHFTextField inputProps={{maxLength: 100}} name="city" size="small"
                          label="Cidade"/>
          </Stack>
          <RHFTextField size="small" name="activitySector" label="Sector de actividade"/>
          <Controller
            name="activityStart"
            render={({field, fieldState: {error}}) => (
              <DesktopDatePicker
                {...field}
                format="dd/MM/yyyy"
                label="Início de actividade"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message,
                    size: "small",
                    placeholder: "Início de actividade",
                  },
                }}
              />
            )}
          />

          <Stack flexDirection="row" >
            <Stack justifyContent="end">
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Gravar
              </LoadingButton>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
