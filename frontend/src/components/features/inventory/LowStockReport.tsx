import { Box, Button, Paper, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi, type Inventory } from '@/api/endpoints/inventory.api';

const LowStockReport = () => { const query = useQuery({ queryKey: ['inventories', 'low-stock'], queryFn: inventoryApi.lowStock }); const columns: GridColDef<Inventory>[] = [{ field: 'product', headerName: 'Sản phẩm', flex: 1, valueGetter: (_, row) => row.product?.name || row.productId }, { field: 'quantity', headerName: 'Tồn', width: 110 }, { field: 'minimumQuantity', headerName: 'Tối thiểu', width: 120 }, { field: 'warehouse', headerName: 'Kho', width: 180, valueGetter: (_, row) => row.warehouse?.name || row.warehouseId }]; return <Box><Typography variant="h4" gutterBottom>Báo cáo sắp hết hàng</Typography><Paper sx={{ p: 2 }}><Button sx={{ mb: 2 }} disabled>Xuất Excel (đang chờ API)</Button><DataGrid autoHeight rows={query.data || []} columns={columns} loading={query.isLoading} /></Paper></Box>; };
export default LowStockReport;
