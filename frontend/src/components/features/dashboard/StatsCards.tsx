import { Inventory2Outlined, MoneyOutlined, ShoppingCartOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import type { DashboardStats } from '@/api/endpoints/dashboard.api';

interface Props { stats?: DashboardStats; isLoading: boolean; }
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

const StatsCards = ({ stats, isLoading }: Props) => {
  const cards = [
    ['Tổng sản phẩm', stats?.products, <Inventory2Outlined color="primary" />],
    ['Tổng đơn hàng', stats?.orders, <ShoppingCartOutlined color="info" />],
    ['Sắp hết hàng', stats?.lowStock ?? stats?.inventory, <WarningAmberOutlined color="warning" />],
    ['Doanh thu', stats?.revenue === undefined ? undefined : currency.format(stats.revenue), <MoneyOutlined color="success" />],
  ] as const;
  return <Grid container spacing={2}>{cards.map(([label, value, icon]) => <Grid item xs={12} sm={6} lg={3} key={label}><Paper sx={{ p: 2.5 }}><Stack direction="row" alignItems="center" spacing={2}><Stack sx={{ p: 1, borderRadius: 1, bgcolor: 'grey.100' }}>{icon}</Stack><Stack><Typography variant="body2" color="text.secondary">{label}</Typography>{isLoading ? <Skeleton width={80} /> : <Typography variant="h5">{value ?? 0}</Typography>}</Stack></Stack></Paper></Grid>)}</Grid>;
};
export default StatsCards;
