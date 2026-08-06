import { yupResolver } from '@hookform/resolvers/yup'; import { Box, Button, Chip, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'; import { useForm } from 'react-hook-form'; import * as yup from 'yup'; import { userApi, type UserPayload } from '@/api/endpoints/user.api'; import { useMutation } from '@tanstack/react-query'; import toast from 'react-hot-toast';

interface UserFormValues {
	username: string;
	password: string;
	email?: string;
	phone?: string;
	avatar?: string;
	roleId: 'WAREHOUSE_STAFF' | 'SALES_STAFF' | 'MANAGER';
}

const schema: yup.ObjectSchema<UserFormValues> = yup.object({
	username: yup.string().required('Username is required.').defined(),
	password: yup.string().min(8, 'Password must be at least 8 characters.').required('Password is required.').defined(),
	email: yup.string().email('Please enter a valid email address.').optional(),
	phone: yup.string().optional(),
	avatar: yup.string().url('Avatar must be a valid URL.').optional(),
	roleId: yup.mixed<'WAREHOUSE_STAFF' | 'SALES_STAFF' | 'MANAGER'>().oneOf(['WAREHOUSE_STAFF', 'SALES_STAFF', 'MANAGER'], 'Please choose a role.').required('Please choose a role.').defined(),
});
const rolePresets = [
	{ id: 'warehouse', label: 'Tài khoản thủ kho', description: 'Có quyền nhập hàng, quản lý tồn kho và xem giao dịch kho.', roleIds: ['WAREHOUSE_STAFF'] },
	{ id: 'sales', label: 'Tài khoản bán hàng', description: 'Dành cho POS, tạo đơn bán và tra cứu sản phẩm.', roleIds: ['SALES_STAFF'] },
	{ id: 'manager', label: 'Tài khoản quản lý', description: 'Xem báo cáo, dashboard và phê duyệt.', roleIds: ['MANAGER'] },
] satisfies Array<{ id: string; label: string; description: string; roleIds: string[] }>;
const UserForm = () => {
	const form = useForm<UserFormValues>({
		resolver: yupResolver(schema),
		defaultValues: { username: '', password: '', email: '', phone: '', avatar: '', roleId: 'WAREHOUSE_STAFF' },
	});
	const mutation = useMutation({ mutationFn: userApi.create });
	const selectedRole = form.watch('roleId');

	const applyPreset = (presetRoleId: UserFormValues['roleId']) => {
		form.setValue('roleId', presetRoleId, { shouldDirty: true, shouldValidate: true });
	};

	const submit = async (values: UserFormValues) => {
		try {
			const payload: UserPayload = {
				username: values.username.trim(),
				password: values.password,
				email: values.email?.trim() || undefined,
				phone: values.phone?.trim() || undefined,
				avatar: values.avatar?.trim() || undefined,
				roleIds: [values.roleId],
			};
			await mutation.mutateAsync(payload);
			toast.success('Đã tạo người dùng.');
			form.reset({ username: '', password: '', email: '', phone: '', avatar: '', roleId: 'WAREHOUSE_STAFF' });
		} catch {
			toast.error('Không thể lưu người dùng.');
		}
	};

	return <Box><Typography variant="h4" gutterBottom>Tạo tài khoản nhân sự</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Mẫu mặc định đang tối ưu cho tài khoản thủ kho. Bạn có thể chuyển sang vai trò bán hàng hoặc quản lý trước khi lưu.</Typography><Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>{rolePresets.map((preset) => <Chip key={preset.id} label={preset.label} onClick={() => applyPreset(preset.roleIds[0] as UserFormValues['roleId'])} color={selectedRole === preset.roleIds[0] ? 'primary' : 'default'} />)}</Stack><Paper component="form" onSubmit={form.handleSubmit(submit)} sx={{ p: 3, maxWidth: 720 }}><Stack spacing={1.5}><TextField {...form.register('username')} label="Username" fullWidth margin="dense" error={Boolean(form.formState.errors.username)} helperText={form.formState.errors.username?.message} /><TextField {...form.register('password')} label="Mật khẩu" type="password" fullWidth margin="dense" error={Boolean(form.formState.errors.password)} helperText={form.formState.errors.password?.message} /><TextField {...form.register('email')} label="Email" fullWidth margin="dense" error={Boolean(form.formState.errors.email)} helperText={form.formState.errors.email?.message} /><TextField {...form.register('phone')} label="Số điện thoại" fullWidth margin="dense" error={Boolean(form.formState.errors.phone)} helperText={form.formState.errors.phone?.message} /><TextField {...form.register('avatar')} label="Avatar URL" fullWidth margin="dense" error={Boolean(form.formState.errors.avatar)} helperText={form.formState.errors.avatar?.message} /><Select value={selectedRole} onChange={(event) => applyPreset(event.target.value as UserFormValues['roleId'])} displayEmpty fullWidth sx={{ mt: 1 }}><MenuItem value="WAREHOUSE_STAFF">WAREHOUSE_STAFF</MenuItem><MenuItem value="SALES_STAFF">SALES_STAFF</MenuItem><MenuItem value="MANAGER">MANAGER</MenuItem></Select></Stack><Button type="submit" variant="contained" sx={{ mt: 2 }}>Lưu</Button></Paper></Box>;
};
export default UserForm;
