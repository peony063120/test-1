import { useState } from 'react';
import { EditOutlined } from '@mui/icons-material';
import { Box, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { inventoryApi, type Inventory } from '@/api/endpoints/inventory.api';

const InventoryList = () => {
  const [warehouseId, setWarehouseId] = useState(''); const navigate = useNavigate();
  const query = useQuery({ queryKey: ['inventories', { warehouseId }], queryFn: () => inventoryApi.list({ warehouseId: warehouseId || undefined }) });
  const result = query.data; const rows = Array.isArray(result) ? result : result?.items || [];
  const columns: GridColDef<Inventory>[] = [
    { field: 'product', headerName: 'Sản phẩm', flex: 1, minWidth: 200, valueGetter: (_, row) => row.product?.name || row.productId },
    { field: 'warehouse', headerName: 'Kho', width: 170, valueGetter: (_, row) => row.warehouse?.name || row.warehouseId },
    { field: 'quantity', headerName: 'Tồn hiện tại', width: 130 }, { field: 'minimumQuantity', headerName: 'Tối thiểu', width: 120 }, { field: 'maximumQuantity', headerName: 'Tối đa', width: 120 },
    { field: 'actions', headerName: '', width: 70, renderCell: ({ row }) => <IconButton onClick={() => navigate(`/inventories/${row.id}/adjust`)}><EditOutlined /></IconButton> },
  ];
  return <Box><Typography variant="h4" gutterBottom>Tồn kho</Typography><Paper sx={{ p: 2 }}><Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 2 }}><TextField label="ID kho" size="small" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} /></Stack><DataGrid autoHeight rows={rows} columns={columns} loading={query.isLoading} disableRowSelectionOnClick /></Paper></Box>;
};
export default InventoryList;
