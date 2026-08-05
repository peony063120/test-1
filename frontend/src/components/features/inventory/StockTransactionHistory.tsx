import { Box, Paper, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { stockTransactionApi, type StockTransaction } from '@/api/endpoints/stock-transaction.api';

const StockTransactionHistory = () => { const query = useQuery({ queryKey: ['stock-transactions'], queryFn: () => stockTransactionApi.list() }); const result = query.data; const rows = Array.isArray(result) ? result : result?.items || []; const columns: GridColDef<StockTransaction>[] = [{ field: 'transactionType', headerName: 'Loại', width: 130 }, { field: 'quantity', headerName: 'Số lượng', width: 120 }, { field: 'beforeQuantity', headerName: 'Trước', width: 110 }, { field: 'afterQuantity', headerName: 'Sau', width: 110 }, { field: 'note', headerName: 'Ghi chú', flex: 1 }, { field: 'createdAt', headerName: 'Thời gian', width: 180, valueFormatter: (value) => new Date(value).toLocaleString('vi-VN') }]; return <Box><Typography variant="h4" gutterBottom>Lịch sử giao dịch kho</Typography><Paper sx={{ p: 2 }}><DataGrid autoHeight rows={rows} columns={columns} loading={query.isLoading} /></Paper></Box>; };
export default StockTransactionHistory;
