import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { HowToRegOutlined } from '@mui/icons-material';
import { Avatar, Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { registerAccount } from '@/store/slices/auth.slice';
import { getDefaultRouteForUser } from '@/utils/auth-routing';
import type { RegisterPayload } from '@/types/auth.types';

const roleOptions = [
  { value: 'SALES_STAFF', label: 'Nhân viên bán hàng / Thu ngân' },
  { value: 'WAREHOUSE_STAFF', label: 'Nhân viên nhập hàng / Thủ kho' },
  { value: 'MANAGER', label: 'Quản lý (chỉ xem báo cáo)' },
] as const;

const validationSchema: yup.ObjectSchema<RegisterPayload> = yup.object({
  username: yup.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự.').required('Vui lòng nhập tên đăng nhập.'),
  email: yup.string().email('Email không hợp lệ.').required('Vui lòng nhập email.'),
  password: yup.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.').required('Vui lòng nhập mật khẩu.'),
  phone: yup.string().optional(),
  roleName: yup
    .mixed<'SALES_STAFF' | 'WAREHOUSE_STAFF' | 'MANAGER'>()
    .oneOf(['SALES_STAFF', 'WAREHOUSE_STAFF', 'MANAGER'])
    .required('Vui lòng chọn vai trò.'),
});

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setFocus } = useForm<RegisterPayload>({
    resolver: yupResolver(validationSchema),
    defaultValues: { username: '', email: '', password: '', phone: '', roleName: 'SALES_STAFF' },
  });

  useEffect(() => {
    setFocus('username');
  }, [setFocus]);

  const onSubmit = async (values: RegisterPayload) => {
    try {
      const response = await dispatch(registerAccount(values)).unwrap();
      toast.success('Đăng ký thành công.');
      navigate(getDefaultRouteForUser(response.user), { replace: true });
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Đăng ký thất bại.')
        : 'Đăng ký thất bại.';
      toast.error(message);
    }
  };

  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
    <Container maxWidth="sm">
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mb: 3 }}>
          <Avatar sx={{ mb: 1, bgcolor: 'primary.main' }}><HowToRegOutlined /></Avatar>
          <Typography variant="h5">Đăng ký tài khoản</Typography>
          <Typography variant="body2" color="text.secondary">Tài khoản mới sẽ được tạo theo vai trò bạn chọn.</Typography>
        </Box>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={1}>
            <TextField {...register('username')} label="Tên đăng nhập" fullWidth error={Boolean(errors.username)} helperText={errors.username?.message} />
            <TextField {...register('email')} label="Email" fullWidth error={Boolean(errors.email)} helperText={errors.email?.message} />
            <TextField {...register('password')} label="Mật khẩu" type="password" fullWidth error={Boolean(errors.password)} helperText={errors.password?.message} />
            <TextField {...register('phone')} label="Số điện thoại" fullWidth error={Boolean(errors.phone)} helperText={errors.phone?.message} />
            <TextField {...register('roleName')} select label="Vai trò" fullWidth error={Boolean(errors.roleName)} helperText={errors.roleName?.message}>
              {roleOptions.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
            </TextField>
          </Stack>
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={isSubmitting}>{isSubmitting ? 'Đang đăng ký...' : 'Tạo tài khoản'}</Button>
          <Button component={Link} to="/login" fullWidth sx={{ mt: 1 }}>Đã có tài khoản? Đăng nhập</Button>
        </Box>
      </Paper>
    </Container>
  </Box>;
};

export default Register;
