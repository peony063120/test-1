import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { LockOutlined } from '@mui/icons-material';
import { Avatar, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/auth.slice';
import type { LoginPayload } from '@/types/auth.types';

const validationSchema: yup.ObjectSchema<LoginPayload> = yup.object({
  username: yup.string().required('Vui lòng nhập tên đăng nhập.'),
  password: yup.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.').required('Vui lòng nhập mật khẩu.'),
});

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setFocus } = useForm<LoginPayload>({ resolver: yupResolver(validationSchema), defaultValues: { username: '', password: '' } });
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  useEffect(() => { setFocus('username'); }, [setFocus]);

  const onSubmit = async (values: LoginPayload) => {
    try {
      await dispatch(login(values)).unwrap();
      toast.success('Đăng nhập thành công.');
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Đăng nhập thất bại.')
        : 'Đăng nhập thất bại.';
      toast.error(message);
    }
  };

  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
    <Container maxWidth="xs">
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mb: 3 }}><Avatar sx={{ mb: 1, bgcolor: 'primary.main' }}><LockOutlined /></Avatar><Typography variant="h5">Đăng nhập</Typography><Typography variant="body2" color="text.secondary">Hệ thống quản lý sản phẩm</Typography></Box>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('username')} label="Tên đăng nhập" fullWidth margin="normal" autoComplete="username" error={Boolean(errors.username)} helperText={errors.username?.message} />
          <TextField {...register('password')} label="Mật khẩu" type="password" fullWidth margin="normal" autoComplete="current-password" error={Boolean(errors.password)} helperText={errors.password?.message} />
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={isSubmitting}>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</Button>
        </Box>
      </Paper>
    </Container>
  </Box>;
};

export default Login;
