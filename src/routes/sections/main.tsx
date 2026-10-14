import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import CompactLayout from 'src/layouts/compact';
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen, SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const Page500 = lazy(() => import('src/pages/500'));
const Page403 = lazy(() => import('src/pages/403'));
const Page404 = lazy(() => import('src/pages/404'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    path: '404',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Page404 />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
  },
  {
    element: (
      <CompactLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </CompactLayout>
    ),
    children: [
      { path: '500', element: <Page500 /> },
      { path: '403', element: <Page403 /> },
    ],
  },
];
