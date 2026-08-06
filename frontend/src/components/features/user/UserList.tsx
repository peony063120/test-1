import { AddOutlined } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { userApi, type ManagedUser } from '@/api/endpoints/user.api';

const UserList = () => {
	const navigate = useNavigate();
	const query = useQuery({ queryKey: ['users'], queryFn: () => userApi.list() });
	const result = query.data;
	const rows = Array.isArray(result) ? result : result?.items || [];

	const columns: GridColDef<ManagedUser>[] = [
		{ field: 'avatar', headerName: '', width: 64, renderCell: ({ row }) => <Avatar src={row.avatar}>{row.username[0]}</Avatar> },
		{ field: 'username', headerName: 'Username', flex: 1 },
		{ field: 'email', headerName: 'Email', flex: 1 },
		{ field: 'status', headerName: 'Trạng thái', width: 130, renderCell: ({ value }) => <Chip size="small" label={value} color={value === 'ACTIVE' ? 'success' : 'default'} /> },
		{ field: 'roles', headerName: 'Vai trò', flex: 1, valueGetter: (_, row) => row.roles?.map((role) => role.name).join(', ') || '—' },
		{ field: 'lastLogin', headerName: 'Đăng nhập cuối', width: 170, valueFormatter: (value) => value ? new Date(value).toLocaleString('vi-VN') : '—' },
	];

	return <Box>
		<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
			<Box>
				<Typography variant="h4" gutterBottom>Người dùng</Typography>
				<Typography color="text.secondary">Tạo và quản lý tài khoản cho thủ kho, bán hàng và quản lý.</Typography>
			</Box>
			<Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate('/users/new')}>
				Tạo tài khoản thủ kho
			</Button>
		</Stack>
		<Paper sx={{ p: 2 }}>
			<DataGrid
				autoHeight
				rows={rows}
				columns={columns}
				loading={query.isLoading}
				disableRowSelectionOnClick
				onRowClick={({ row }) => navigate(`/users/${row.id}`)}
			/>
		</Paper>
	</Box>;
};

export default UserList;
