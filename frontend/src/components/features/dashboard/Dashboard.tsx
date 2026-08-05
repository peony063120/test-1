import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatsCards from './StatsCards';
import RecentActivities from './RecentActivities';
import { useDashboardStats, useLowStock, useRecentActivities, useRevenueData } from '@/hooks/useDashboard';

const Dashboard = () => {
  const stats = useDashboardStats(); const revenue = useRevenueData(); const activities = useRecentActivities(); const lowStock = useLowStock();
  return <Box><Typography variant="h4" gutterBottom>Tổng quan</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Theo dõi nhanh tình trạng kinh doanh và tồn kho.</Typography>
    <StatsCards stats={{ products: stats.data?.products ?? 0, orders: stats.data?.orders ?? 0, inventory: stats.data?.inventory ?? 0, revenue: stats.data?.revenue ?? 0, lowStock: lowStock.data?.length }} isLoading={stats.isLoading || lowStock.isLoading} />
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ mt: 2 }}>
      <Paper sx={{ p: 2.5, flex: 2, minHeight: 340 }}><Typography variant="h6" gutterBottom>Doanh thu theo thời gian</Typography>{revenue.isLoading ? <Skeleton height={260} /> : <ResponsiveContainer width="100%" height={260}><LineChart data={revenue.data || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} /></LineChart></ResponsiveContainer>}</Paper>
      <Paper sx={{ p: 2.5, flex: 1 }}><Typography variant="h6">Cảnh báo tồn kho</Typography>{lowStock.isLoading ? <Skeleton height={160} /> : <Stack spacing={1.5} sx={{ mt: 2 }}>{lowStock.data?.length ? lowStock.data.map((item) => <Box key={item.id}><Typography>{item.product?.name || 'Sản phẩm'}</Typography><Typography variant="body2" color="error">Còn {item.quantity} / tối thiểu {item.minimumQuantity}</Typography></Box>) : <Typography color="text.secondary">Không có cảnh báo tồn kho.</Typography>}</Stack>}</Paper>
    </Stack><Box sx={{ mt: 2 }}><RecentActivities activities={activities.data} isLoading={activities.isLoading} /></Box>
  </Box>;
};
export default Dashboard;
