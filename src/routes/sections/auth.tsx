import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard, GuestGuard } from 'src/auth/guard';
// layouts
import AuthClassicLayout from 'src/layouts/auth/classic';
// components
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const LoginPage = lazy(() => import('src/pages/auth/jwt/login'));
const ForgotPasswordPage = lazy(() => import('src/pages/auth/jwt/forgot-password'));
const ResetPasswordPage = lazy(() => import('src/pages/auth/jwt/reset-password'));
const SetPasswordPage = lazy(() => import('src/pages/auth/jwt/set-password'));

// ----------------------------------------------------------------------

export const authRoutes = [
  {
    path: 'auth',
    element: (
      <GuestGuard>
        <AuthClassicLayout>
          <Suspense fallback={<SplashScreen />}>
            <Outlet />
          </Suspense>
        </AuthClassicLayout>
      </GuestGuard>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    // Fora do GuestGuard: o utilizador ja esta autenticado com a palavra-passe
    // temporaria e tem de definir a definitiva. AuthGuard impede acesso sem sessao
    // e impede saltar este passo enquanto passwordChangedAt for null.
    path: 'auth/set-password',
    element: (
      <AuthGuard>
        <AuthClassicLayout>
          <Suspense fallback={<SplashScreen />}>
            <SetPasswordPage />
          </Suspense>
        </AuthClassicLayout>
      </AuthGuard>
    ),
  },
];
