import { useState } from 'react';
import { DashboardOutlined, LogoutOutlined, Menu as MenuIcon } from '@mui/icons-material';
import { AppBar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/common/Notifications/NotificationBell';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const signOut = () => { logout(); navigate('/login', { replace: true }); };
  const navItems = [{ label: 'Tổng quan', icon: <DashboardOutlined />, to: '/dashboard' }];
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
    <AppBar position="fixed" sx={{ zIndex: (value) => value.zIndex.drawer + 1 }}><Toolbar><IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}><MenuIcon /></IconButton><Typography variant="h6" sx={{ flexGrow: 1 }}>Quản lý sản phẩm</Typography><NotificationBell /><Typography variant="body2">{user?.username}</Typography></Toolbar></AppBar>
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}><Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>{sidebar}</Drawer><Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }} open>{sidebar}</Drawer></Box>
    <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8 }}><Outlet /></Box>
  </Box>;
};

export default MainLayout;
