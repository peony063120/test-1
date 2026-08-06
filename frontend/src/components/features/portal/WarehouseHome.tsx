import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const panels = [
  { title: 'Phiếu nhập kho', subtitle: 'Tạo và theo dõi lịch sử phiếu nhập.', to: '/purchase-orders' },
  { title: 'Cập nhật tồn kho', subtitle: 'Điều chỉnh tồn kho theo từng kho.', to: '/inventories' },
  { title: 'Nhà cung cấp', subtitle: 'Quản lý danh sách và thông tin nhà cung cấp.', to: '/suppliers' },
];

const WarehouseHome = () => {
  return <Box>
    <Typography variant="h4" gutterBottom>Không gian nhập hàng / thủ kho</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      Chỉ thao tác nhập kho, tồn kho và nhà cung cấp. Không có quyền thay đổi giá bán hoặc xóa sản phẩm.
    </Typography>
    <Grid container spacing={2}>
      {panels.map((panel) => <Grid item xs={12} md={4} key={panel.title}>
        <Card component={RouterLink} to={panel.to} sx={{ textDecoration: 'none', height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{panel.title}</Typography>
            <Typography color="text.secondary">{panel.subtitle}</Typography>
          </CardContent>
        </Card>
      </Grid>)}
    </Grid>
  </Box>;
};

export default WarehouseHome;
