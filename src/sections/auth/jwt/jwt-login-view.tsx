import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { pathAfterAuthentication } from 'src/auth/context/jwt/utils';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('O utilizador ou email é obrigatório'),
  password: Yup.string().required('A palavra-passe é obrigatória'),
});

export default function JwtLoginView() {
  const { login } = useAuthContext();

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await login(data.username, data.password);

      if (result?.mustChangePassword) {
        router.push(paths.auth.setPassword);
        return;
      }

      const destination = pathAfterAuthentication();
      router.push(returnTo ?? destination);
    } catch (error) {
      reset({ username: methods.getValues('username'), password: '' });
      enqueueSnackbar(error?.message ?? 'Credenciais inválidas.', { variant: 'error' });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2} sx={{ mb: 5, mt: -5 }}>
        <Typography variant="h4">Iniciar sessão</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Introduza o nome de utilizador ou email e a palavra-passe.
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        <RHFTextField
          name="username"
          label="Utilizador ou email"
          autoComplete="username"
        />
        <RHFTextField
          name="password"
          label="Palavra-passe"
          autoComplete="current-password"
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

        <Link
          component={RouterLink}
          href={paths.auth.forgotPassword}
          variant="body2"
          color="inherit"
          underline="always"
          sx={{ alignSelf: 'flex-end' }}
        >
          Esqueceu a palavra-passe?
        </Link>

        <LoadingButton
          fullWidth
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
          sx={{ justifyContent: 'space-between', pl: 2, pr: 1.5 }}
        >
          Entrar
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
