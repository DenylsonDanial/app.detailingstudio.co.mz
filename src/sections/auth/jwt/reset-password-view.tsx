import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { enqueueSnackbar } from 'notistack';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { useRouter, useSearchParams } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
// utils
import axios, { endpoints } from 'src/utils/axios';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// assets
import { PasswordIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'A palavra-passe deve ter pelo menos 8 caracteres')
    .required('A palavra-passe é obrigatória'),
  passwordConfirm: Yup.string()
    .required('A confirmação é obrigatória')
    .oneOf([Yup.ref('password')], 'As palavras-passe devem ser iguais'),
});

export default function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const password = useBoolean();

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { password: '', passwordConfirm: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axios.post(endpoints.auth.resetPassword, { ...data, token });
      enqueueSnackbar('Palavra-passe redefinida com sucesso.');
      router.push(paths.auth.login);
    } catch (error) {
      enqueueSnackbar(error?.message ?? 'O link é inválido ou já expirou.', { variant: 'error' });
    }
  });

  if (!token) {
    return (
      <Alert severity="error">
        Link inválido. Peça uma nova recuperação de palavra-passe a partir do ecrã de início de
        sessão.
      </Alert>
    );
  }

  const passwordAdornment = (
    <InputAdornment position="end">
      <IconButton onClick={password.onToggle} edge="end">
        <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
      </IconButton>
    </InputAdornment>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Definir nova palavra-passe</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Escolha uma palavra-passe com pelo menos 8 caracteres.
        </Typography>
      </Stack>

      <Stack spacing={3} alignItems="center">
        <RHFTextField
          name="password"
          label="Nova palavra-passe"
          autoComplete="new-password"
          type={password.value ? 'text' : 'password'}
          InputProps={{ endAdornment: passwordAdornment }}
        />

        <RHFTextField
          name="passwordConfirm"
          label="Confirmar palavra-passe"
          autoComplete="new-password"
          type={password.value ? 'text' : 'password'}
          InputProps={{ endAdornment: passwordAdornment }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Guardar palavra-passe
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
