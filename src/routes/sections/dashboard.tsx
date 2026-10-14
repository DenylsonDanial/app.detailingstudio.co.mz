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

const OverviewPage = lazy(() => import('src/pages/dashboard/overview'));

const UserListPage = lazy(() => import('src/pages/users/userlist'));
const UserNewPage = lazy(() => import('src/pages/users/usercreate'));
const UserEditPage = lazy(() => import('src/pages/users/userEdit'));

const RoleListPage = lazy(() => import('src/pages/roles/rolelist'));
const RoleNewPage = lazy(() => import('src/pages/roles/rolecreate'));
const RoleEditPage = lazy(() => import('src/pages/roles/roleedit'));

const PermissionListPage = lazy(() => import('src/pages/permissions/permissions'));
const SettingsPage = lazy(() => import('src/pages/settings/settings'));

// ----------------------------------------------------------------------

/** Envolve um elemento na barreira de permissao com o ecra de acesso negado. */
const guarded = (permissions: string[], element: React.ReactNode) => (
  <RoleBasedGuard permissions={permissions} hasContent>
    {element}
  </RoleBasedGuard>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
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
      { index: true, element: <OverviewPage /> },
      {
        path: 'users',
        children: [
          { path: 'list', element: guarded([Authorities.READ_USERS], <UserListPage />) },
          { path: 'new', element: guarded([Authorities.CREATE_USERS], <UserNewPage />) },
          { path: ':id/edit', element: guarded([Authorities.UPDATE_USERS], <UserEditPage />) },
        ],
      },
      {
        path: 'roles',
        children: [
          { path: 'list', element: guarded([Authorities.READ_ROLES], <RoleListPage />) },
          { path: 'new', element: guarded([Authorities.CREATE_ROLES], <RoleNewPage />) },
          { path: ':id/edit', element: guarded([Authorities.UPDATE_ROLES], <RoleEditPage />) },
        ],
      },
      {
        path: 'permissions',
        children: [
          {
            path: 'list',
            element: guarded([Authorities.READ_PERMISSIONS], <PermissionListPage />),
          },
        ],
      },
      {
        path: 'settings',
        element: guarded([Authorities.READ_SETTINGS], <SettingsPage />),
      },
    ],
  },
];
