import { Helmet } from 'react-helmet-async';
// config
import { APP_NAME } from 'src/config-global';
// sections
import { ForgotPasswordView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Recuperar palavra-passe | {APP_NAME}</title>
      </Helmet>

      <ForgotPasswordView />
    </>
  );
}
