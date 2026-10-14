import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { enqueueSnackbar } from 'notistack';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { pathAfterAuthentication } from 'src/auth/context/jwt/utils';
// assets
import { PasswordIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { getApiErrorMessage } from 'src/utils/axios';

// ----------------------------------------------------------------------

const SetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'A palavra-passe deve ter pelo menos 8 caracteres')
    .required('A palavra-passe é obrigatória'),
  passwordConfirm: Yup.string()
    .required('A confirmação é obrigatória')
    .oneOf([Yup.ref('password')], 'As palavras-passe devem ser iguais'),
});

/**
 * Primeiro acesso: o utilizador entrou com uma palavra-passe temporaria e tem
 * de escolher a definitiva antes de poder usar o sistema.
 */
export default function SetPasswordView() {
  const password = useBoolean();
  const router = useRouter();
  const { setInitialPassword } = useAuthContext();

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(SetPasswordSchema),
    defaultValues: { password: '', passwordConfirm: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await setInitialPassword(data.password, data.passwordConfirm);

      enqueueSnackbar('Palavra-passe definida com sucesso.');
      router.push(pathAfterAuthentication());
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Verifique os dados introduzidos.'), {
        variant: 'error',
      });
    }
  });

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
        <Typography variant="h3">Proteja a sua conta</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Está a usar uma palavra-passe temporária. Defina agora a sua palavra-passe definitiva.
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
