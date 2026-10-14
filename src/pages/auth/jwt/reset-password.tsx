import { Helmet } from 'react-helmet-async';
// config
import { APP_NAME } from 'src/config-global';
// sections
import { ResetPasswordView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function ResetPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Nova palavra-passe | {APP_NAME}</title>
      </Helmet>

      <ResetPasswordView />
    </>
  );
}
