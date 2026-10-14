import { Helmet } from 'react-helmet-async';
// config
import { APP_NAME } from 'src/config-global';
// sections
import { JwtLoginView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Iniciar sessão | {APP_NAME}</title>
      </Helmet>

      <JwtLoginView />
    </>
  );
}
