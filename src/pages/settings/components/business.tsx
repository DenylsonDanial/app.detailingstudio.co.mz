import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, MenuItem, Stack } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import { enqueueSnackbar } from 'notistack';
//
import FormProvider, { RHFSelect, RHFTextField } from '../../../components/hook-form';
import {
  useGetBusinessMutation,
  useUpdateBusinessMutation,
} from '../../../redux/services/businessService';
import { useGetCurrenciesQuery } from '../../../redux/services/commonService';
import { IBusinessSetting } from '../../../types/businessSetting';
import { ICurrency } from '../../../types/currency';

// ----------------------------------------------------------------------

type FormValues = {
  currencyId: string;
  defaultTaxRate: number;
  email?: string;
  address?: string;
  website?: string;
  activitySector?: string;
};

const BusinessSettingSchema = Yup.object().shape({
  currencyId: Yup.string().required('A moeda é obrigatória.'),
  defaultTaxRate: Yup.number()
    .typeError('Taxa inválida.')
    .min(0, 'Taxa inválida.')
    .max(100, 'Taxa inválida.')
    .nullable(),
  email: Yup.string().email('Email inválido.'),
  address: Yup.string().max(255, 'Endereço demasiado longo.'),
  website: Yup.string().max(255, 'Website demasiado longo.'),
  activitySector: Yup.string().max(150, 'Sector demasiado longo.'),
});

export default function BusinessSetting() {
  const [currentBusiness, setCurrentBusiness] = useState<IBusinessSetting>({});

  const [getBusiness] = useGetBusinessMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const { currentData } = useGetCurrenciesQuery();

  const defaultValues: FormValues = useMemo(
    () => ({
      currencyId: String(currentBusiness?.currencyId || ''),
      defaultTaxRate: Number(currentBusiness?.defaultTaxRate ?? 16),
      email: currentBusiness?.email || '',
      address: currentBusiness?.address || '',
      website: currentBusiness?.website || '',
      activitySector: currentBusiness?.activitySector || '',
    }),
    [currentBusiness]
  );

  const methods = useForm<FormValues>({
    resolver: yupResolver(BusinessSettingSchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const loadBusiness = useCallback(async () => {
    const settings = await getBusiness().unwrap();
    setCurrentBusiness(settings);
    reset({
      currencyId: String(settings.currencyId || ''),
      defaultTaxRate: Number(settings.defaultTaxRate ?? 16),
      email: settings.email || '',
      address: settings.address || '',
      website: settings.website || '',
      activitySector: settings.activitySector || '',
    });
  }, [getBusiness, reset]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateBusiness({
        ...currentBusiness,
        ...data,
        currencyId: data.currencyId ? Number(data.currencyId) as any : data.currencyId,
        defaultTaxRate: Number(data.defaultTaxRate ?? 16),
      }).unwrap();
      enqueueSnackbar('Actualizado com sucesso!');
    } catch (error) {
      enqueueSnackbar('Não foi possível guardar as definições.', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={1}>
        <Grid xs={12} md={5} item sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          {currentData && (
            <RHFSelect required name="currencyId" size="small" label="Moeda">
              {currentData?.map((n: ICurrency) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.name} - ({n.shortName})
                </MenuItem>
              ))}
            </RHFSelect>
          )}

          <RHFTextField
            type="number"
            inputMode="decimal"
            size="small"
            name="defaultTaxRate"
            label="Taxa IVA padrão (%)"
          />
          <RHFTextField size="small" name="email" label="Email institucional" />
          <RHFTextField size="small" name="website" label="Website" />
          <RHFTextField size="small" name="address" label="Morada" />
          <RHFTextField size="small" name="activitySector" label="Sector de actividade" />

          <Stack flexDirection="row">
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
