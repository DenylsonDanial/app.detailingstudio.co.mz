import { useCallback, useEffect, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hook';
// components
import { LoadingScreen } from 'src/components/loading-screen';
//
import { useAuthContext } from '../hooks';
import { needsPasswordChange, pathAfterAuthentication } from '../context/jwt/utils';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, loading, user } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();
      router.replace(`${paths.auth.login}?${searchParams}`);
      return;
    }

    const mustChange = needsPasswordChange(user);
    const onSetPassword = pathname === paths.auth.setPassword;

    if (mustChange && !onSetPassword) {
      router.replace(paths.auth.setPassword);
      return;
    }

    if (!mustChange && onSetPassword) {
      router.replace(pathAfterAuthentication());
      return;
    }

    setChecked(true);
  }, [authenticated, loading, pathname, router, user]);

  useEffect(() => {
    check();
  }, [check]);

  if (loading || !checked) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
