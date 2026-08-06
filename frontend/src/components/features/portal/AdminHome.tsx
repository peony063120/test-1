import { AdminPanelSettingsOutlined, ManageAccountsOutlined, SecurityOutlined, SettingsOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const actions = [
  { title: 'Quản lý người dùng', description: 'Thêm, sửa, xóa tài khoản và phân quyền.', to: '/users', icon: <ManageAccountsOutlined fontSize="large" /> },
  { title: 'Quản lý vai trò', description: 'Thiết lập vai trò và quyền thao tác.', to: '/roles', icon: <SecurityOutlined fontSize="large" /> },
  { title: 'Cấu hình hệ thống', description: 'Danh mục, thương hiệu, đơn vị tính, tham số hệ thống.', to: '/settings', icon: <SettingsOutlined fontSize="large" /> },
  { title: 'Nhật ký hoạt động', description: 'Theo dõi thao tác người dùng và thay đổi dữ liệu.', to: '/audit-logs', icon: <AdminPanelSettingsOutlined fontSize="large" /> },
];

const AdminHome = () => {
  return <Box>
    <Typography variant="h4" gutterBottom>Dashboard quản trị viên</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Toàn quyền quản trị hệ thống và dữ liệu.</Typography>
    <Grid container spacing={2}>
      {actions.map((action) => <Grid item xs={12} md={6} key={action.title}>
        <Card component={RouterLink} to={action.to} sx={{ textDecoration: 'none', height: '100%' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              {action.icon}
              <Typography variant="h6">{action.title}</Typography>
            </Stack>
            <Typography color="text.secondary">{action.description}</Typography>
          </CardContent>
        </Card>
      </Grid>)}
    </Grid>
  </Box>;
};

export default AdminHome;
