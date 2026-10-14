import { Helmet } from 'react-helmet-async';
// @mui
import Stack from '@mui/material/Stack';
// config
import { APP_NAME } from 'src/config-global';
// sections
import { SetPasswordView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function SetPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Definir palavra-passe | {APP_NAME}</title>
      </Helmet>

      <Stack sx={{ width: 1, mx: 'auto', maxWidth: 490, px: { xs: 2, md: 8 } }}>
        <SetPasswordView />
      </Stack>
    </>
  );
}
