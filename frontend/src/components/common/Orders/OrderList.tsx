import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { AddOutlined, VisibilityOutlined } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface Order { id: string; code?: string; status: string; totalAmount?: number; orderDate?: string; }
interface Props<T extends Order> { title: string; keyName: string; list: () => Promise<T[] | { items: T[] }>; path: string; }
const OrderList = <T extends Order>({ title, keyName, list, path }: Props<T>) => { const navigate = useNavigate(); const query = useQuery({ queryKey: [keyName], queryFn: list }); const result = query.data; const rows = Array.isArray(result) ? result : result?.items || []; const columns: GridColDef<T>[] = [{ field: 'code', headerName: 'Mã đơn', flex: 1, minWidth: 150, valueGetter: (_, row) => row.code || row.id }, { field: 'status', headerName: 'Trạng thái', width: 150, renderCell: ({ value }) => <Chip label={value} size="small" /> }, { field: 'totalAmount', headerName: 'Tổng tiền', width: 150, valueFormatter: (value) => Number(value || 0).toLocaleString('vi-VN') }, { field: 'orderDate', headerName: 'Ngày tạo', width: 170, valueFormatter: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '—' }, { field: 'actions', headerName: '', width: 70, renderCell: ({ row }) => <Button size="small" startIcon={<VisibilityOutlined />} onClick={() => navigate(`${path}/${row.id}`)}>Xem</Button> }]; return <Box><Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h4">{title}</Typography><Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate(`${path}/new`)}>Tạo đơn</Button></Stack><Paper sx={{ p: 2 }}><DataGrid autoHeight rows={rows} columns={columns} loading={query.isLoading} /></Paper></Box>; };
export default OrderList;
