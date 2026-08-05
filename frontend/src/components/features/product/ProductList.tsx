import { useState } from 'react';
import { AddOutlined, DeleteOutline, EditOutlined, SearchOutlined } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProductMutations, useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/product.types';
import { useAuth } from '@/hooks/useAuth';

const ProductList = () => {
  const navigate = useNavigate(); const { user } = useAuth(); const [page, setPage] = useState(0); const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts({ page: page + 1, limit: 20, search }); const { remove } = useProductMutations();
  const can = (permission: string) => user?.permissions.includes(permission) ?? false;
  const columns: GridColDef<Product>[] = [
    { field: 'sku', headerName: 'SKU', width: 130, valueGetter: (_, row) => row.sku || '—' },
    { field: 'name', headerName: 'Sản phẩm', flex: 1, minWidth: 180 },
    { field: 'category', headerName: 'Danh mục', width: 150, valueGetter: (_, row) => row.category?.name || '—' },
    { field: 'price', headerName: 'Giá bán', width: 130, valueFormatter: (value) => Number(value || 0).toLocaleString('vi-VN') },
    { field: 'isActive', headerName: 'Trạng thái', width: 120, renderCell: ({ value }) => <Chip size="small" color={value ? 'success' : 'default'} label={value ? 'Hoạt động' : 'Ngừng'} /> },
    { field: 'actions', headerName: '', width: 110, sortable: false, renderCell: ({ row }) => <>{can('product.update') && <IconButton aria-label="Sửa" onClick={() => navigate(`/products/${row.id}/edit`)}><EditOutlined /></IconButton>}{can('product.delete') && <IconButton aria-label="Xóa" color="error" onClick={() => { if (window.confirm(`Xóa ${row.name}?`)) remove.mutate(row.id, { onSuccess: () => toast.success('Đã xóa sản phẩm.'), onError: () => toast.error('Không thể xóa sản phẩm.') }); }}><DeleteOutline /></IconButton>}</> },
  ];
  return <Box><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}><Typography variant="h4">Sản phẩm</Typography>{can('product.create') && <Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate('/products/new')}>Thêm sản phẩm</Button>}</Stack><Paper sx={{ p: 2 }}><TextField size="small" placeholder="Tìm theo tên hoặc SKU" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} sx={{ mb: 2, width: { xs: '100%', sm: 320 } }} /><DataGrid autoHeight rows={data?.items || []} columns={columns} loading={isLoading} getRowId={(row) => row.id} paginationMode="server" rowCount={data?.meta.total || 0} paginationModel={{ page, pageSize: 20 }} onPaginationModelChange={(model) => setPage(model.page)} pageSizeOptions={[20]} disableRowSelectionOnClick onRowClick={({ row }) => navigate(`/products/${row.id}`)} /></Paper></Box>;
};
export default ProductList;
