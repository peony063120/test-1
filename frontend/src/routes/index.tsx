import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import PrivateRoute from './PrivateRoute';
import MainLayout from '@/components/common/Layout/MainLayout';

const Login = lazy(() => import('@/components/features/auth/Login'));
const Dashboard = lazy(() => import('@/components/features/dashboard/Dashboard'));
const UserList = lazy(() => import('@/components/features/user/UserList'));
const UserForm = lazy(() => import('@/components/features/user/UserForm'));
const RoleList = lazy(() => import('@/components/features/role/RoleList'));
const ReportInventory = lazy(() => import('@/components/features/report/ReportInventory'));
const SystemSettings = lazy(() => import('@/components/features/setting/SystemSettings'));
const AuditLog = lazy(() => import('@/components/features/audit/AuditLog'));

const LoadingPage = () => <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}><CircularProgress /></Box>;
const NotFound = () => <Box sx={{ p: 4 }}><Typography variant="h4">404</Typography><Typography color="text.secondary">Không tìm thấy trang bạn yêu cầu.</Typography></Box>;
const lazyElement = (component: React.ReactNode) => <Suspense fallback={<LoadingPage />}>{component}</Suspense>;

export const router = createBrowserRouter([
  { path: '/login', element: lazyElement(<Login />) },
  {
    element: <PrivateRoute />,
    children: [{ element: <MainLayout />, children: [{ path: '/dashboard', element: lazyElement(<Dashboard />) }, { path: '/users', element: lazyElement(<UserList />) }, { path: '/users/new', element: lazyElement(<UserForm />) }, { path: '/roles', element: lazyElement(<RoleList />) }, { path: '/reports/inventory', element: lazyElement(<ReportInventory />) }, { path: '/settings', element: lazyElement(<SystemSettings />) }, { path: '/audit-logs', element: lazyElement(<AuditLog />) }] }],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <NotFound /> },
]);
