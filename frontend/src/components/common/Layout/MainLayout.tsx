import { useMemo, useState } from 'react';
import {
  AdminPanelSettingsOutlined,
  DashboardOutlined,
  Inventory2Outlined,
  LogoutOutlined,
  ManageAccountsOutlined,
  Menu as MenuIcon,
  PointOfSaleOutlined,
  ReceiptLongOutlined,
  SettingsOutlined,
  StoreOutlined,
  SummarizeOutlined,
  WarehouseOutlined,
} from '@mui/icons-material';
import { AppBar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/common/Notifications/NotificationBell';
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES, ROLE_WAREHOUSE, can, hasRole } from '@/constants/rbac';

const drawerWidth = 260;

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const signOut = () => { logout(); navigate('/login', { replace: true }); };

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [{ label: 'Tổng quan', icon: <DashboardOutlined />, to: '/dashboard' }];

    if (hasRole(user, ROLE_ADMIN)) {
      items.push(
        { label: 'Admin Dashboard', icon: <AdminPanelSettingsOutlined />, to: '/admin' },
        { label: 'Người dùng', icon: <ManageAccountsOutlined />, to: '/users' },
        { label: 'Vai trò', icon: <SettingsOutlined />, to: '/roles' },
        { label: 'Cấu hình hệ thống', icon: <SettingsOutlined />, to: '/settings' },
        { label: 'Nhật ký hoạt động', icon: <ReceiptLongOutlined />, to: '/audit-logs' },
      );
    }

    if (hasRole(user, ROLE_WAREHOUSE) || hasRole(user, ROLE_ADMIN)) {
      items.push(
        { label: 'Không gian kho', icon: <WarehouseOutlined />, to: '/warehouse' },
        { label: 'Phiếu nhập hàng', icon: <Inventory2Outlined />, to: '/purchase-orders' },
        { label: 'Tồn kho', icon: <StoreOutlined />, to: '/inventories' },
        { label: 'Nhà cung cấp', icon: <StoreOutlined />, to: '/suppliers' },
      );
    }

    if (hasRole(user, ROLE_SALES) || hasRole(user, ROLE_ADMIN)) {
      items.push(
        { label: 'Màn hình POS', icon: <PointOfSaleOutlined />, to: '/sales/pos' },
        { label: 'Đơn bán hàng', icon: <ReceiptLongOutlined />, to: '/sales-orders' },
      );
    }

    if (hasRole(user, ROLE_MANAGER) || hasRole(user, ROLE_ADMIN)) {
      items.push(
        { label: 'Dashboard quản lý', icon: <SummarizeOutlined />, to: '/manager' },
        { label: 'Báo cáo tồn kho', icon: <SummarizeOutlined />, to: '/reports/inventory' },
      );
    }

    if (can(user, 'product.read')) {
      items.push({ label: 'Danh sách sản phẩm', icon: <StoreOutlined />, to: '/products' });
    }

    return items;
  }, [user]);

  const sidebar = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar><Typography variant="h6" color="primary">Product Manager</Typography></Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => <ListItemButton key={item.to} component={NavLink} to={item.to} onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1, '&.active': { bgcolor: 'primary.50', color: 'primary.main' } }}><ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} /></ListItemButton>)}
      </List>
      <Box sx={{ mt: 'auto', p: 1 }}><ListItemButton onClick={signOut} sx={{ borderRadius: 1 }}><ListItemIcon sx={{ minWidth: 40 }}><LogoutOutlined /></ListItemIcon><ListItemText primary="Đăng xuất" /></ListItemButton></Box>
    </Box>
  );

  return <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <AppBar position="fixed" sx={{ zIndex: (value) => value.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}><MenuIcon /></IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Quản lý sản phẩm</Typography>
        <NotificationBell />
        <Typography variant="body2">{user?.username}</Typography>
      </Toolbar>
    </AppBar>
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
        {sidebar}
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }} open>
        {sidebar}
      </Drawer>
    </Box>
    <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8 }}><Outlet /></Box>
  </Box>;
};

export default MainLayout;
