import type { PropsWithChildren } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { TransactionsPage } from '@/features/transactions/pages/TransactionsPage';
import { RulesPage } from '@/features/rules/pages/RulesPage';
import { AuditLogsPage } from '@/features/audit/pages/AuditLogsPage';
import { MerchantsPage } from '@/features/merchants/pages/MerchantsPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { ProtectedRoute } from '@/shared/components/navigation/ProtectedRoute';
import { PublicOnlyRoute } from '@/shared/components/navigation/PublicOnlyRoute';
import { getDefaultPathForRole } from '@/shared/utils/roleAccess';
import type { UserRole } from '@/types/auth';

const ProtectedLayout = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

interface RoleGateProps extends PropsWithChildren {
  allowedRoles: UserRole[];
}

const RoleGate = ({ allowedRoles, children }: RoleGateProps) => {
  const { session } = useAuth();
  if (!allowedRoles.includes(session.role)) {
    return <Navigate to={getDefaultPathForRole(session.role)} replace />;
  }
  return <>{children}</>;
};

const RoleHomePage = () => {
  const { session } = useAuth();
  if (session.role === 'Merchant' || session.role === 'Analyst' || session.role === 'Unknown') {
    return <DashboardPage />;
  }
  return <Navigate to={getDefaultPathForRole(session.role)} replace />;
};

export const appRouter = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/auth/login', element: <LoginPage /> },
      { path: '/auth/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/', element: <RoleHomePage /> },
          {
            path: '/transactions',
            element: (
              <RoleGate allowedRoles={['Analyst']}>
                <TransactionsPage />
              </RoleGate>
            ),
          },
          {
            path: '/rules',
            element: (
              <RoleGate allowedRoles={['Analyst']}>
                <RulesPage />
              </RoleGate>
            ),
          },
          {
            path: '/audit',
            element: (
              <RoleGate allowedRoles={['Analyst']}>
                <AuditLogsPage />
              </RoleGate>
            ),
          },
          {
            path: '/merchants',
            element: (
              <RoleGate allowedRoles={['Analyst']}>
                <MerchantsPage />
              </RoleGate>
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
