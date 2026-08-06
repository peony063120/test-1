import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const panels = [
  { title: 'Phiếu nhập kho', subtitle: 'Tạo phiếu nhập từ barcode, tên hàng và ảnh sản phẩm.', to: '/warehouse/intake' },
  { title: 'Cập nhật tồn kho', subtitle: 'Điều chỉnh tồn kho theo từng kho.', to: '/inventories' },
  { title: 'Lịch sử nhập xuất', subtitle: 'Xem giao dịch kho theo từng sản phẩm và kho.', to: '/stock-transactions' },
  { title: 'Nhà cung cấp', subtitle: 'Quản lý danh sách và thông tin nhà cung cấp.', to: '/suppliers' },
];

const WarehouseHome = () => {
  return <Box>
    <Typography variant="h4" gutterBottom>Không gian nhập hàng / thủ kho</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      Chỉ thao tác nhập kho, tồn kho và nhà cung cấp. Giao diện này đã tách riêng luồng quét barcode, tạo phiếu nhập và nhận phiếu đã duyệt.
    </Typography>
    <Grid container spacing={2}>
      {panels.map((panel) => <Grid item xs={12} md={6} key={panel.title}>
        <Card component={RouterLink} to={panel.to} sx={{ textDecoration: 'none', height: '100%' }}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">{panel.title}</Typography>
              <Typography color="text.secondary">{panel.subtitle}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>)}
    </Grid>
  </Box>;
};

export default WarehouseHome;
