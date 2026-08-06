import { Box, Paper, Typography } from '@mui/material';
import Dashboard from '@/components/features/dashboard/Dashboard';
import ReportInventory from '@/components/features/report/ReportInventory';

const ManagerHome = () => {
  return <Box>
    <Typography variant="h4" gutterBottom>Dashboard quản lý</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>
      Chế độ chỉ xem: theo dõi tồn kho, nhập xuất và doanh thu. Không có quyền tạo/sửa/xóa dữ liệu.
    </Typography>
    <Paper sx={{ p: 2, mb: 2 }}>
      <Dashboard />
    </Paper>
    <Paper sx={{ p: 2 }}>
      <ReportInventory />
    </Paper>
  </Box>;
};

export default ManagerHome;
