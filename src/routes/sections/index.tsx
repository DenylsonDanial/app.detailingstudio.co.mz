import { Navigate, useRoutes } from 'react-router-dom';
//
import { authRoutes } from './auth';
import { companyRoutes } from './company';
import { dashboardRoutes } from './dashboard';
import { mainRoutes } from './main';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    { path: '/', element: <Navigate to="/dashboard" replace /> },

    ...dashboardRoutes,

    ...companyRoutes,

    ...authRoutes,

    ...mainRoutes,

    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
