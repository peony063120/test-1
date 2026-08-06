import { useCallback, useMemo, useState } from 'react';
import { CameraAltOutlined, ClearAllOutlined, Inventory2Outlined, KeyboardOutlined, LocalShippingOutlined, ReceiptLongOutlined, SearchOutlined, VideocamOffOutlined } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { purchaseOrderApi, type OrderLine } from '@/api/endpoints/purchase-order.api';
import { productApi } from '@/api/endpoints/product.api';
import type { Product } from '@/types/product.types';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

type DraftLine = {
  product: Product;
  quantity: number;
  price: number;
};

const resolveDefaultPrice = (product: Product) => Number(product.costPrice ?? product.price ?? 0);

const WarehouseIntake = () => {
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [note, setNote] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [draftLines, setDraftLines] = useState<DraftLine[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  const addProduct = useCallback((product: Product) => {
    setDraftLines((current) => {
      const index = current.findIndex((line) => line.product.id === product.id);
      if (index >= 0) {
        const next = [...current];
        next[index] = {
          ...next[index],
          quantity: next[index].quantity + 1,
        };
        return next;
      }

      return [
        ...current,
        {
          product,
          quantity: 1,
          price: resolveDefaultPrice(product),
        },
      ];
    });
  }, []);

  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    await lookupByBarcode(barcode);
  }, []);

  const { videoRef, cameraEnabled, cameraError, startCamera, stopCamera } = useBarcodeScanner({
    onDetected: handleBarcodeDetected,
  });

  const totalAmount = useMemo(
    () => draftLines.reduce((sum, line) => sum + Number(line.price || 0) * line.quantity, 0),
    [draftLines],
  );

  const lookupByBarcode = useCallback(async (barcode: string) => {
    const value = barcode.trim();
    if (!value) {
      toast.error('Vui lòng nhập barcode trước khi tra cứu.');
      return;
    }

    try {
      const product = await productApi.getByBarcode(value);
      if (!product) {
        toast.error('Không tìm thấy sản phẩm theo barcode này.');
        return;
      }

      addProduct(product);
      setManualBarcode('');
      toast.success(`Đã thêm ${product.name} vào phiếu nhập.`);
    } catch {
      toast.error('Không thể tra cứu sản phẩm theo barcode.');
    }
  }, [addProduct]);

  const updateLine = (productId: string, changes: Partial<DraftLine>) => {
    setDraftLines((current) => current.map((line) => (
      line.product.id === productId ? { ...line, ...changes } : line
    )));
  };

  const removeLine = (productId: string) => {
    setDraftLines((current) => current.filter((line) => line.product.id !== productId));
  };

  const clearDraft = () => {
    setDraftLines([]);
    setNote('');
    setManualBarcode('');
  };

  const createPurchaseOrder = async () => {
    if (!supplierId.trim() || !warehouseId.trim()) {
      toast.error('Cần nhập supplierId và warehouseId.');
      return;
    }

    if (!draftLines.length) {
      toast.error('Phiếu nhập đang trống.');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        supplierId: supplierId.trim(),
        warehouseId: warehouseId.trim(),
        note: note.trim() || undefined,
        details: draftLines.map<OrderLine>((line) => ({
          productId: line.product.id,
          quantity: Number(line.quantity),
          price: Number(line.price),
        })),
      };
      const created = await purchaseOrderApi.create(payload);
      toast.success('Đã tạo phiếu nhập nháp thành công.');
      setPurchaseOrderId(created.id);
    } catch {
      toast.error('Không thể tạo phiếu nhập. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setIsCreating(false);
    }
  };

  const receivePurchaseOrder = async () => {
    if (!purchaseOrderId.trim()) {
      toast.error('Cần nhập mã phiếu nhập để nhận hàng.');
      return;
    }

    setIsReceiving(true);
    try {
      await purchaseOrderApi.receive(purchaseOrderId.trim(), note.trim() || undefined);
      toast.success('Đã ghi nhận nhập kho cho phiếu đã duyệt.');
    } catch {
      toast.error('Không thể nhận phiếu nhập. Hãy kiểm tra trạng thái phiếu và quyền của bạn.');
    } finally {
      setIsReceiving(false);
    }
  };

  return <Box>
    <Typography variant="h4" gutterBottom>Giao diện thủ kho / nhập hàng</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      Hỗ trợ quét barcode, nhập tay, xem ảnh sản phẩm, tạo phiếu nhập và nhận phiếu đã duyệt.
    </Typography>

    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Inventory2Outlined color="primary" />
            <Typography variant="h6">Thêm sản phẩm vào phiếu nhập</Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              value={manualBarcode}
              onChange={(event) => setManualBarcode(event.target.value)}
              label="Barcode hoặc mã sản phẩm"
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }}
            />
            <Button variant="contained" onClick={() => void lookupByBarcode(manualBarcode)}>Tra cứu</Button>
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            {!cameraEnabled
              ? <Button variant="outlined" startIcon={<CameraAltOutlined />} onClick={() => void startCamera()}>Mở camera quét</Button>
              : <Button variant="outlined" color="warning" startIcon={<VideocamOffOutlined />} onClick={stopCamera}>Tắt camera</Button>}
          </Stack>
          {cameraError && <Alert severity="warning" sx={{ mb: 1 }}>{cameraError}</Alert>}
          <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#0f172a' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', minHeight: 260, display: cameraEnabled ? 'block' : 'none' }} />
            {!cameraEnabled && <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>Camera chưa bật</Box>}
          </Box>
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">Danh sách hàng nhập</Typography>
            <Chip label={`${draftLines.length} sản phẩm`} color="primary" variant="outlined" />
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={72} />
                <TableCell>Sản phẩm</TableCell>
                <TableCell align="right">Giá nhập</TableCell>
                <TableCell align="right">Số lượng</TableCell>
                <TableCell align="right">Thành tiền</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {draftLines.map((line) => {
                const imageUrl = line.product.imageUrls?.[0];
                return <TableRow key={line.product.id}>
                  <TableCell>
                    <Avatar variant="rounded" src={imageUrl} alt={line.product.name} sx={{ width: 48, height: 48 }} />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{line.product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      SKU: {line.product.sku || '—'} | Barcode: {line.product.barcode || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" width={170}>
                    <TextField
                      size="small"
                      type="number"
                      value={line.price}
                      onChange={(event) => updateLine(line.product.id, { price: Number(event.target.value) })}
                      inputProps={{ min: 0 }}
                    />
                  </TableCell>
                  <TableCell align="right" width={140}>
                    <TextField
                      size="small"
                      type="number"
                      value={line.quantity}
                      onChange={(event) => updateLine(line.product.id, { quantity: Number(event.target.value) })}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {(Number(line.price || 0) * Number(line.quantity || 0)).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => removeLine(line.product.id)}>
                      <ClearAllOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>;
              })}
              {!draftLines.length && <TableRow><TableCell colSpan={6}>Chưa có sản phẩm nào trong phiếu.</TableCell></TableRow>}
            </TableBody>
          </Table>

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mt: 2 }}>
            <Typography variant="h6">Tổng giá trị tạm tính: {totalAmount.toLocaleString('vi-VN')} VND</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" onClick={clearDraft}>Xóa phiếu</Button>
              <Button variant="contained" onClick={() => void createPurchaseOrder()} disabled={isCreating}>
                {isCreating ? 'Đang tạo...' : 'Tạo phiếu nhập'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <LocalShippingOutlined color="primary" />
            <Typography variant="h6">Thông tin phiếu nhập</Typography>
          </Stack>
          <Stack spacing={1.5}>
            <TextField label="ID nhà cung cấp" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} fullWidth />
            <TextField label="ID kho" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} fullWidth />
            <TextField label="Ghi chú" value={note} onChange={(event) => setNote(event.target.value)} fullWidth multiline minRows={3} />
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <ReceiptLongOutlined color="primary" />
            <Typography variant="h6">Nhận phiếu đã duyệt</Typography>
          </Stack>
          <Stack spacing={1.5}>
            <TextField label="Mã phiếu nhập" value={purchaseOrderId} onChange={(event) => setPurchaseOrderId(event.target.value)} fullWidth />
            <TextField label="Ghi chú nhận hàng" value={note} onChange={(event) => setNote(event.target.value)} fullWidth multiline minRows={3} />
            <Button variant="contained" onClick={() => void receivePurchaseOrder()} disabled={isReceiving}>
              {isReceiving ? 'Đang nhận...' : 'Nhận hàng vào kho'}
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </Box>;
};

export default WarehouseIntake;
