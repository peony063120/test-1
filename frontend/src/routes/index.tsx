import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import PrivateRoute from './PrivateRoute';
import MainLayout from '@/components/common/Layout/MainLayout';

const Login = lazy(() => import('@/components/features/auth/Login'));
const Register = lazy(() => import('@/components/features/auth/Register'));
const Dashboard = lazy(() => import('@/components/features/dashboard/Dashboard'));
const UserList = lazy(() => import('@/components/features/user/UserList'));
const UserDetail = lazy(() => import('@/components/features/user/UserDetail'));
const UserForm = lazy(() => import('@/components/features/user/UserForm'));
const RoleList = lazy(() => import('@/components/features/role/RoleList'));
const ReportInventory = lazy(() => import('@/components/features/report/ReportInventory'));
const SystemSettings = lazy(() => import('@/components/features/setting/SystemSettings'));
const AuditLog = lazy(() => import('@/components/features/audit/AuditLog'));
const ProductList = lazy(() => import('@/components/features/product/ProductList'));
const ProductForm = lazy(() => import('@/components/features/product/ProductForm'));
const InventoryList = lazy(() => import('@/components/features/inventory/InventoryList'));
const InventoryAdjust = lazy(() => import('@/components/features/inventory/InventoryAdjust'));
const StockTransactionHistory = lazy(() => import('@/components/features/inventory/StockTransactionHistory'));
const PurchaseOrderList = lazy(() => import('@/components/features/purchase-order/PurchaseOrderList'));
const SalesOrderList = lazy(() => import('@/components/features/sales-order/SalesOrderList'));
const SupplierList = lazy(() => import('@/components/features/supplier/SupplierList'));
const WarehouseIntake = lazy(() => import('@/components/features/warehouse/WarehouseIntake'));
const AdminHome = lazy(() => import('@/components/features/portal/AdminHome'));
const WarehouseHome = lazy(() => import('@/components/features/portal/WarehouseHome'));
const ManagerHome = lazy(() => import('@/components/features/portal/ManagerHome'));
const SalesPos = lazy(() => import('@/components/features/portal/SalesPos'));

const LoadingPage = () => <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}><CircularProgress /></Box>;
const NotFound = () => <Box sx={{ p: 4 }}><Typography variant="h4">404</Typography><Typography color="text.secondary">Không tìm thấy trang bạn yêu cầu.</Typography></Box>;
const lazyElement = (component: React.ReactNode) => <Suspense fallback={<LoadingPage />}>{component}</Suspense>;

export const router = createBrowserRouter([
  { path: '/login', element: lazyElement(<Login />) },
  { path: '/register', element: lazyElement(<Register />) },
  {
    element: <PrivateRoute />,
    children: [{
      element: <MainLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: '/dashboard', element: lazyElement(<Dashboard />) },
        { path: '/profile', element: lazyElement(<UserDetail />) },

        { element: <PrivateRoute allowedRoles={['ADMIN']} />, children: [
          { path: '/admin', element: lazyElement(<AdminHome />) },
          { path: '/users', element: lazyElement(<UserList />) },
          { path: '/users/:id', element: lazyElement(<UserDetail />) },
          { path: '/users/new', element: lazyElement(<UserForm />) },
          { path: '/roles', element: lazyElement(<RoleList />) },
          { path: '/settings', element: lazyElement(<SystemSettings />) },
          { path: '/audit-logs', element: lazyElement(<AuditLog />) },
          { path: '/products/new', element: lazyElement(<ProductForm />) },
          { path: '/products/:id/edit', element: lazyElement(<ProductForm />) },
        ] },

        { element: <PrivateRoute allowedRoles={['ADMIN', 'WAREHOUSE_STAFF']} />, children: [
          { path: '/warehouse', element: lazyElement(<WarehouseHome />) },
          { path: '/warehouse/intake', element: lazyElement(<WarehouseIntake />) },
          { path: '/purchase-orders', element: lazyElement(<PurchaseOrderList />) },
          { path: '/inventories', element: lazyElement(<InventoryList />) },
          { path: '/inventories/:id/adjust', element: lazyElement(<InventoryAdjust />) },
          { path: '/suppliers', element: lazyElement(<SupplierList />) },
        ] },

        { element: <PrivateRoute allowedRoles={['ADMIN', 'WAREHOUSE_STAFF', 'MANAGER']} />, children: [
          { path: '/stock-transactions', element: lazyElement(<StockTransactionHistory />) },
        ] },

        { element: <PrivateRoute allowedRoles={['ADMIN', 'SALES_STAFF']} />, children: [
          { path: '/sales/pos', element: lazyElement(<SalesPos />) },
          { path: '/sales-orders', element: lazyElement(<SalesOrderList />) },
        ] },

        { element: <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']} />, children: [
          { path: '/manager', element: lazyElement(<ManagerHome />) },
          { path: '/reports/inventory', element: lazyElement(<ReportInventory />) },
        ] },

        { path: '/products', element: lazyElement(<ProductList />) },
      ],
    }],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <NotFound /> },
]);
