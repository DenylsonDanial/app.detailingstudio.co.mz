import * as Yup from 'yup';
import React, { useState } from 'react';
import { FieldErrors, useForm, UseFormSetError } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, Modal, Step, StepLabel, Stepper } from '@mui/material';
import Container from '@mui/material/Container';
import FormProvider from 'src/components/hook-form';
import { getApiErrorMessage } from 'src/utils/axios';
import Iconify from '../../components/iconify';
import { palette } from '../../theme/palette';
import { useSettingsContext } from '../../components/settings';
import { BusinessSettingFields } from './component/BusinessSettingFields';
import { UserFields } from './component/UserFields';
import { FinishSetup } from './component/FinishSetup';
import { ICompany } from '../../types/company';
import { IUserCreate, validateUser, ValidationErrors } from '../../types/user';
import { useSaveCompanyMutation } from '../../redux/services/companyService';
import { paths } from '../../routes/paths';
import { usePageHeader } from '../../layouts/dashboard/page-header-context';
// ----------------------------------------------------------------------

type Props = {
  currentCompany?: ICompany;
  isEdit?: boolean;
};

/** Metical no seed V3 (ordem fixa em instalacoes novas). */
const DEFAULT_CURRENCY_ID = 1;

type CompanyFormValues = {
  userId: string | number | null;
  user: IUserCreate;
  businessSetting: {
    businessName: string;
  };
};

const steps = ['Dados da empresa', 'Utilizador - Administrador', 'Finalizar'];

const CompanySetupSchema = Yup.object().shape({
  user: Yup.object().shape({
    username: Yup.string(),
    email: Yup.string(),
    firstName: Yup.string(),
    surname: Yup.string(),
    password: Yup.string(),
    passwordConfirm: Yup.string(),
    rolesIds: Yup.array(),
  }),
  businessSetting: Yup.object().shape({
    businessName: Yup.string().required('Nome é obrigatório'),
  }),
});

const defaultValues: CompanyFormValues = {
  userId: '',
  user: {
    username: '',
    email: '',
    firstName: '',
    surname: '',
    rolesIds: [],
    passwordConfirm: '',
    password: '',
  },
  businessSetting: {
    businessName: '',
  },
};

function notifyApiError(error: unknown) {
  if (error && typeof error === 'object' && 'data' in error) {
    const { data } = error as { data: unknown };
    if (Array.isArray(data) && data.length > 0 && data.every((item) => typeof item === 'string')) {
      data.forEach((item) => enqueueSnackbar(item, { variant: 'error' }));
      return;
    }
    enqueueSnackbar(getApiErrorMessage(data ?? error, 'Verifique os dados introduzidos.'), {
      variant: 'error',
    });
    return;
  }
  enqueueSnackbar(getApiErrorMessage(error, 'Ocorreu um erro inesperado'), { variant: 'error' });
}

export default function CompanyNewEditForm(_props: Props) {
  const [open, setOpen] = useState(false);
  const { themeStretch } = useSettingsContext();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped] = React.useState(new Set<number>());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const [saveCompany] = useSaveCompanyMutation();

  const methods = useForm<CompanyFormValues>({
    defaultValues,
    resolver: yupResolver(CompanySetupSchema) as never,
  });

  const { handleSubmit, setError, reset, getValues } = methods;
  const isStepSkipped = (step: number) => skipped.has(step);

  const handleValidationErrors = (
    errors: ValidationErrors,
    setErrorFn: UseFormSetError<CompanyFormValues>
  ) => {
    Object.keys(errors).forEach((field) => {
      const fieldName = field === 'roles' ? 'rolesIds' : field;
      setErrorFn(`user.${fieldName}` as 'user.username', {
        type: 'manual',
        message: errors[field],
      });
    });
  };

  const goToFirstInvalidStep = (formErrors: FieldErrors<CompanyFormValues>) => {
    if (formErrors.businessSetting) {
      setActiveStep(0);
      return;
    }
    if (formErrors.user || formErrors.userId) {
      setActiveStep(1);
    }
  };

  const onInvalid = (formErrors: FieldErrors<CompanyFormValues>) => {
    enqueueSnackbar('Verifique os dados introduzidos.', { variant: 'error' });
    goToFirstInvalidStep(formErrors);
  };

  const onValid = async (data: CompanyFormValues) => {
    const errors = validateUser(data.userId, data.user);

    if (Object.keys(errors).length > 0) {
      setActiveStep(1);
      handleValidationErrors(errors, setError);
      enqueueSnackbar('Verifique os dados do utilizador.', { variant: 'error' });
      return;
    }

    const userId = Number(data.userId) || 0;

    try {
      setIsSubmitting(true);
      await saveCompany({
        userId,
        user: data.user,
        businessSetting: {
          businessName: data.businessSetting.businessName,
          currencyId: DEFAULT_CURRENCY_ID,
        },
      }).unwrap();
      reset();
      enqueueSnackbar('Criado com sucesso!');
      navigate(paths.dashboard.company.list);
    } catch (error) {
      notifyApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = handleSubmit(onValid, onInvalid);

  const handleNext = async () => {
    if (activeStep === 0) {
      const isValid = await methods.trigger(['businessSetting.businessName']);
      if (isValid) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
      return;
    }

    if (activeStep === 1) {
      const values = getValues();
      const errors = validateUser(values.userId, values.user);
      if (Object.keys(errors).length > 0) {
        handleValidationErrors(errors, setError);
        enqueueSnackbar('Verifique os dados do utilizador.', { variant: 'error' });
        return;
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BusinessSettingFields />;
      case 1:
        return <UserFields />;
      default:
        return <FinishSetup />;
    }
  };

  const settings = useSettingsContext();

  function getStyles() {
    return {
      background: palette(settings.themeMode).background.neutral,
      border: `1px solid ${palette(settings.themeMode).divider}`,
      flex: 1,
      padding: 3,
    };
  }

  usePageHeader({
    title: 'Nova empresa',
    actions: (
      <LoadingButton
        variant="contained"
        color="success"
        loading={isSubmitting}
        endIcon={<Iconify icon="eva:arrow-right-outline" />}
        onClick={() => (activeStep === steps.length - 1 ? onSubmit() : handleNext())}
      >
        {activeStep === steps.length - 1 ? 'Submeter' : 'Próximo'}
      </LoadingButton>
    ),
  });

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <Card color="" sx={getStyles()}>
        <Box sx={{ width: '100%' }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          <>
            <FormProvider methods={methods} onSubmit={onSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                {renderStepContent(activeStep)}
              </Box>
            </FormProvider>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Voltar
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
            </Box>
          </>
        </Box>
      </Card>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={getStyles()} />
      </Modal>
    </Container>
  );
}
