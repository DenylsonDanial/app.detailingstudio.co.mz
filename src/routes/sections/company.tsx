import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard, RoleBasedGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';
//
import { Authorities } from 'src/utils/authorities';

// ----------------------------------------------------------------------

const CompanyListPage = lazy(() => import('src/pages/company/companylist'));
const CompanyNewPage = lazy(() => import('src/pages/company/companycreate'));
const CompanyEditPage = lazy(() => import('src/pages/company/companyedit'));

const guarded = (permissions: string[], element: React.ReactNode) => (
  <RoleBasedGuard permissions={permissions} hasContent>
    {element}
  </RoleBasedGuard>
);

/** Gestao das empresas cliente da plataforma: exclusivo do super administrador. */
export const companyRoutes = [
  {
    path: 'companies',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { path: 'list', element: guarded([Authorities.READ_COMPANIES], <CompanyListPage />) },
      { path: 'new', element: guarded([Authorities.CREATE_COMPANIES], <CompanyNewPage />) },
      { path: ':id/edit', element: guarded([Authorities.UPDATE_COMPANIES], <CompanyEditPage />) },
    ],
  },
];
