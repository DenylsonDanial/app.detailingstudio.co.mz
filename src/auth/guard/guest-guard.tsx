import { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';
import { needsPasswordChange, pathAfterAuthentication } from '../context/jwt/utils';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function GuestGuard({ children }: Props) {
  const router = useRouter();

  const { authenticated, loading, user } = useAuthContext();

  const check = useCallback(() => {
    if (loading || !authenticated) {
      return;
    }

    if (needsPasswordChange(user)) {
      router.replace(paths.auth.setPassword);
      return;
    }

    router.replace(pathAfterAuthentication());
  }, [authenticated, loading, router, user]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}
