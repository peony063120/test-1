import { List, ListItem, ListItemText, Paper, Skeleton, Typography } from '@mui/material';
import type { DashboardActivity } from '@/api/endpoints/dashboard.api';

interface Props { activities?: DashboardActivity[]; isLoading: boolean; }
const RecentActivities = ({ activities = [], isLoading }: Props) => <Paper sx={{ p: 2.5, height: '100%' }}><Typography variant="h6">Hoạt động gần đây</Typography>{isLoading ? <><Skeleton /><Skeleton /><Skeleton /></> : <List disablePadding>{activities.length ? activities.map((item) => <ListItem key={item.id} divider><ListItemText primary={item.title} secondary={item.description || new Date(item.createdAt).toLocaleString('vi-VN')} /></ListItem>) : <Typography color="text.secondary" sx={{ mt: 2 }}>Chưa có hoạt động gần đây.</Typography>}</List>}</Paper>;
export default RecentActivities;
