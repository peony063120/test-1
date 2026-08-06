import { useMemo, useState } from 'react';
import { DownloadOutlined, FilterAltOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { inventoryApi, type Inventory } from '@/api/endpoints/inventory.api';
import { stockTransactionApi, type StockTransaction } from '@/api/endpoints/stock-transaction.api';

interface InventoryReportRow {
  id: string;
  warehouseName: string;
  productName: string;
  sku?: string;
  barcode?: string;
  importedQuantity: number;
  exportedQuantity: number;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number;
  status: 'LOW' | 'NORMAL' | 'OVER';
}

const asArray = <T,>(value: T[] | { items?: T[] } | undefined) => {
  if (Array.isArray(value)) {
    return value;
  }
  return value?.items || [];
};

const formatDate = (value: string | Date) => new Date(value).toLocaleString('vi-VN');

const autoWidth = (value: string, min = 12) => Math.max(min, value.length + 4);

const getTransactionDirection = (transaction: StockTransaction) => {
  if (transaction.quantity > 0) {
    return 'imported';
  }
  if (transaction.quantity < 0) {
    return 'exported';
  }
  return 'neutral';
};

const ReportInventory = () => {
  const [warehouseId, setWarehouseId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const inventoryQuery = useQuery({
    queryKey: ['reports', 'inventory', warehouseId],
    queryFn: () => inventoryApi.list({ warehouseId: warehouseId || undefined }),
  });

  const inventories = asArray<Inventory>(inventoryQuery.data);

  const rows = useMemo<InventoryReportRow[]>(() => inventories.map((inventory) => {
    const quantity = Number(inventory.quantity || 0);
    const minimumQuantity = Number(inventory.minimumQuantity || 0);
    const maximumQuantity = Number(inventory.maximumQuantity || 0);

    return {
      id: inventory.id,
      warehouseName: inventory.warehouse?.name || inventory.warehouseId,
      productName: inventory.product?.name || inventory.productId,
      sku: inventory.product?.sku || undefined,
      barcode: (inventory.product as { barcode?: string } | undefined)?.barcode || undefined,
      importedQuantity: 0,
      exportedQuantity: 0,
      currentQuantity: quantity,
      minimumQuantity,
      maximumQuantity,
      status: quantity <= minimumQuantity ? 'LOW' : quantity >= maximumQuantity ? 'OVER' : 'NORMAL',
    };
  }), [inventories]);

  const exportFile = async () => {
    setIsExporting(true);
    try {
      const rowsWithTransactions = await Promise.all(rows.map(async (row) => {
        const transactionResponse = await stockTransactionApi.list({ inventoryId: row.id, page: 1, limit: 1000 });
        const transactions = asArray<StockTransaction>(transactionResponse);
        const importedQuantity = transactions
          .filter((transaction) => getTransactionDirection(transaction) === 'imported')
          .reduce((sum, transaction) => sum + Math.abs(Number(transaction.quantity || 0)), 0);
        const exportedQuantity = transactions
          .filter((transaction) => getTransactionDirection(transaction) === 'exported')
          .reduce((sum, transaction) => sum + Math.abs(Number(transaction.quantity || 0)), 0);

        return {
          ...row,
          importedQuantity,
          exportedQuantity,
        };
      }));

      const workbook = XLSX.utils.book_new();
      const generatedAt = formatDate(new Date());
      const summaryTotals = [
        ['Inventory report summary'],
        ['Generated at', generatedAt],
        ['Warehouse filter', warehouseId || 'All warehouses'],
        ['Total current quantity', totalCurrent],
        ['Low stock items', lowCount],
        ['Over stock items', overCount],
        [],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryTotals);
      XLSX.utils.sheet_add_json(summarySheet, rowsWithTransactions.map((row) => ({
        Warehouse: row.warehouseName,
        Product: row.productName,
        SKU: row.sku || '',
        Barcode: row.barcode || '',
        Imported: row.importedQuantity,
        Exported: row.exportedQuantity,
        OnHand: row.currentQuantity,
        Min: row.minimumQuantity,
        Max: row.maximumQuantity,
        Status: row.status === 'LOW' ? 'Low stock' : row.status === 'OVER' ? 'Over stock' : 'Normal',
      })), { origin: 'A9' });

      const transactionRows = await Promise.all(rows.map(async (row) => {
        const transactionResponse = await stockTransactionApi.list({ inventoryId: row.id, page: 1, limit: 1000 });
        return asArray<StockTransaction>(transactionResponse).map((transaction) => ({
          Warehouse: row.warehouseName,
          Product: row.productName,
          Type: transaction.transactionType,
          Quantity: transaction.quantity,
          Before: transaction.beforeQuantity,
          After: transaction.afterQuantity,
          Time: formatDate(transaction.createdAt),
          Note: transaction.note || '',
        }));
      }));

      const flatTransactionRows = transactionRows.flat();
      const transactionSheet = XLSX.utils.aoa_to_sheet([
        ['Inventory transaction detail'],
        ['Generated at', generatedAt],
        ['Warehouse filter', warehouseId || 'All warehouses'],
        [],
      ]);
      XLSX.utils.sheet_add_json(transactionSheet, flatTransactionRows, { origin: 'A5' });

      summarySheet['!cols'] = [
        { wch: autoWidth('Warehouse', 18) },
        { wch: autoWidth('Product', 24) },
        { wch: autoWidth('SKU', 16) },
        { wch: autoWidth('Barcode', 18) },
        { wch: autoWidth('Imported', 12) },
        { wch: autoWidth('Exported', 12) },
        { wch: autoWidth('OnHand', 12) },
        { wch: autoWidth('Min', 10) },
        { wch: autoWidth('Max', 10) },
        { wch: autoWidth('Status', 14) },
      ];

      transactionSheet['!cols'] = [
        { wch: autoWidth('Warehouse', 18) },
        { wch: autoWidth('Product', 24) },
        { wch: autoWidth('Type', 14) },
        { wch: autoWidth('Quantity', 12) },
        { wch: autoWidth('Before', 12) },
        { wch: autoWidth('After', 12) },
        { wch: autoWidth('Time', 22) },
        { wch: autoWidth('Note', 30) },
      ];

      summarySheet['!autofilter'] = { ref: 'A9:J' + (rowsWithTransactions.length + 9) };
      transactionSheet['!autofilter'] = { ref: 'A5:H' + (flatTransactionRows.length + 4) };

      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ton kho tong hop');
      XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Giao dich kho');
      XLSX.writeFile(workbook, `inventory-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  const columns: GridColDef<InventoryReportRow>[] = [
    { field: 'warehouseName', headerName: 'Kho', flex: 1, minWidth: 160 },
    { field: 'productName', headerName: 'Sản phẩm', flex: 1.2, minWidth: 220 },
    { field: 'sku', headerName: 'SKU', width: 140 },
    { field: 'barcode', headerName: 'Barcode', width: 160 },
    { field: 'importedQuantity', headerName: 'Đã nhập', width: 110 },
    { field: 'exportedQuantity', headerName: 'Đã xuất', width: 110 },
    { field: 'currentQuantity', headerName: 'Còn lại', width: 110 },
    { field: 'minimumQuantity', headerName: 'Tối thiểu', width: 110 },
    { field: 'maximumQuantity', headerName: 'Tối đa', width: 110 },
    { field: 'status', headerName: 'Trạng thái', width: 120 },
  ];

  const totalCurrent = rows.reduce((sum, row) => sum + row.currentQuantity, 0);
  const lowCount = rows.filter((row) => row.status === 'LOW').length;
  const overCount = rows.filter((row) => row.status === 'OVER').length;

  return <Box>
    <Typography variant="h4" gutterBottom>Báo cáo tồn kho</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>
      Xuất Excel sạch với tổng hợp hàng đã nhập, hàng đã xuất và tồn còn lại theo từng sản phẩm / kho.
    </Typography>

    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Tổng tồn hiện tại</Typography><Typography variant="h5">{totalCurrent.toLocaleString('vi-VN')}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Cảnh báo tồn thấp</Typography><Typography variant="h5">{lowCount}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Tồn vượt ngưỡng</Typography><Typography variant="h5">{overCount}</Typography></CardContent></Card></Grid>
    </Grid>

    <Paper sx={{ p: 2.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          label="ID kho"
          value={warehouseId}
          onChange={(event) => setWarehouseId(event.target.value)}
          InputProps={{ startAdornment: <FilterAltOutlined sx={{ mr: 1, color: 'text.secondary' }} /> }}
        />
        <Button variant="contained" startIcon={<DownloadOutlined />} onClick={() => void exportFile()} disabled={isExporting || inventoryQuery.isLoading}>
          {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
        </Button>
      </Stack>
      <DataGrid autoHeight rows={rows} columns={columns} loading={inventoryQuery.isLoading || isExporting} disableRowSelectionOnClick />
    </Paper>
  </Box>;
};

export default ReportInventory;
