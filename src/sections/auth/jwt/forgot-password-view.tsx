import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
// utils
import axios, { endpoints } from 'src/utils/axios';
// assets
import { PasswordIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().required('O e-mail é obrigatório').email('Endereço de e-mail inválido'),
});

export default function ForgotPasswordView() {
  const [sent, setSent] = useState(false);

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // A API responde sempre com sucesso, mesmo que o e-mail nao exista, para nao
  // permitir descobrir que contas estao registadas.
  const onSubmit = handleSubmit(async (data) => {
    await axios.post(endpoints.auth.forgotPassword, data).catch(() => undefined);
    setSent(true);
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Esqueceu a palavra-passe?</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Indique o e-mail associado à sua conta e enviaremos um link para definir uma nova
          palavra-passe.
        </Typography>
      </Stack>

      <Stack spacing={3} alignItems="center">
        {sent && (
          <Alert severity="success" sx={{ width: 1 }}>
            Se o endereço estiver registado, receberá um e-mail com instruções nos próximos minutos.
          </Alert>
        )}

        <RHFTextField name="email" label="Endereço de e-mail" autoComplete="email" />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Enviar link de recuperação
        </LoadingButton>

        <Link
          component={RouterLink}
          href={paths.auth.login}
          color="inherit"
          variant="subtitle2"
          sx={{ alignItems: 'center', display: 'inline-flex' }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} sx={{ mr: 0.5 }} />
          Voltar ao início de sessão
        </Link>
      </Stack>
    </FormProvider>
  );
}
