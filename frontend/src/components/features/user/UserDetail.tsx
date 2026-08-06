import type { ReactNode } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { Avatar } from '@mui/material';
import { ArrowBackOutlined, AssignmentIndOutlined, BadgeOutlined, EmailOutlined, PhoneOutlined, ShieldOutlined, AccessTimeOutlined } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi, type ManagedUser } from '@/api/endpoints/user.api';
import { useAuth } from '@/hooks/useAuth';

const formatDate = (value?: string) => {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString('vi-VN');
};

const InfoRow = ({ label, value, icon }: { label: string; value?: string | number | null; icon: ReactNode }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    {icon}
    <Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value || '—'}</Typography>
    </Box>
  </Stack>
);

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const targetId = id || currentUser?.id;

  const query = useQuery<ManagedUser>({
    queryKey: ['users', targetId],
    queryFn: () => userApi.get(targetId!),
    enabled: Boolean(targetId),
  });

  const user = query.data;
  const permissions = user?.permissions || (currentUser && currentUser.id === user?.id ? currentUser.permissions : []);

  if (!targetId) {
    return <Box><Typography variant="h5">Không có người dùng để hiển thị.</Typography></Box>;
  }

  return <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h4" gutterBottom>Hồ sơ người dùng</Typography>
        <Typography color="text.secondary">Xem đầy đủ thông tin tài khoản, vai trò và quyền truy cập.</Typography>
      </Box>
      <Button startIcon={<ArrowBackOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
    </Stack>

    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Avatar src={user?.avatar} sx={{ width: 88, height: 88, fontSize: 32 }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h5">{user?.username || 'Đang tải...'}</Typography>
                <Typography color="text.secondary">{user?.email || 'Chưa có email'}</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                <Chip size="small" color={user?.status === 'ACTIVE' ? 'success' : 'default'} label={user?.status || '—'} />
                {user?.roles?.map((role) => <Chip key={role.id || role.name} size="small" variant="outlined" label={role.name} />)}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Thông tin chi tiết</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><InfoRow label="Tên đăng nhập" value={user?.username} icon={<BadgeOutlined color="primary" />} /></Grid>
              <Grid item xs={12} sm={6}><InfoRow label="Email" value={user?.email} icon={<EmailOutlined color="primary" />} /></Grid>
              <Grid item xs={12} sm={6}><InfoRow label="Số điện thoại" value={user?.phone} icon={<PhoneOutlined color="primary" />} /></Grid>
              <Grid item xs={12} sm={6}><InfoRow label="Đăng nhập cuối" value={formatDate(user?.lastLogin)} icon={<AccessTimeOutlined color="primary" />} /></Grid>
              <Grid item xs={12} sm={6}><InfoRow label="Ngày tạo" value={formatDate(user?.createdAt)} icon={<AssignmentIndOutlined color="primary" />} /></Grid>
              <Grid item xs={12} sm={6}><InfoRow label="Cập nhật cuối" value={formatDate(user?.updatedAt)} icon={<AssignmentIndOutlined color="primary" />} /></Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Quyền truy cập</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {permissions?.length
                ? permissions.map((permission) => <Chip key={permission} icon={<ShieldOutlined />} label={permission} variant="outlined" />)
                : <Typography color="text.secondary">Chưa có dữ liệu quyền.</Typography>}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>;
};

export default UserDetail;
