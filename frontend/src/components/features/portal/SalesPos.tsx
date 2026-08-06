import { useEffect, useMemo, useRef, useState } from 'react';
import { CameraAltOutlined, DeleteOutline, PrintOutlined, SearchOutlined, ShoppingCartOutlined, VideocamOffOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Divider, IconButton, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { productApi } from '@/api/endpoints/product.api';
import { salesOrderApi } from '@/api/endpoints/sales-order.api';
import type { Product } from '@/types/product.types';

interface CartItem {
  product: Product;
  quantity: number;
}

const SalesPos = () => {
  const [barcode, setBarcode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraEnabled(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
    } catch {
      setCameraError('Không thể mở camera. Hãy kiểm tra quyền truy cập camera của trình duyệt.');
    }
  };

  const addProductToCart = (product: Product) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.product.id === product.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], quantity: next[index].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const lookupBarcode = async () => {
    if (!barcode.trim()) {
      toast.error('Vui lòng nhập mã sản phẩm.');
      return;
    }
    try {
      const product = await productApi.getByBarcode(barcode.trim());
      if (!product) {
        toast.error('Không tìm thấy sản phẩm theo mã đã nhập.');
        return;
      }
      addProductToCart(product);
      toast.success(`Đã thêm ${product.name} vào giỏ.`);
      setBarcode('');
    } catch {
      toast.error('Không thể tra cứu mã sản phẩm.');
    }
  };

  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0), [cart]);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) => prev.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  };

  const createOrder = async () => {
    if (!customerId.trim() || !warehouseId.trim()) {
      toast.error('Cần nhập customerId và warehouseId để tạo đơn hàng.');
      return;
    }
    if (!cart.length) {
      toast.error('Giỏ hàng đang trống.');
      return;
    }

    setIsSubmitting(true);
    try {
      await salesOrderApi.create({
        customerId: customerId.trim(),
        warehouseId: warehouseId.trim(),
        details: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: Number(item.product.price || 0),
        })),
      });
      toast.success('Đã tạo đơn hàng thành công.');
      setCart([]);
    } catch {
      toast.error('Không thể tạo đơn hàng. Kiểm tra dữ liệu khách hàng/kho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <Box>
    <Typography variant="h4" gutterBottom>Màn hình bán hàng nhanh (POS)</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>
      Chỉ xem sản phẩm/tồn kho tổng quát và tạo đơn bán. Không có quyền nhập hàng hoặc sửa giá sản phẩm.
    </Typography>

    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
      <Paper sx={{ p: 2, flex: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField value={barcode} onChange={(event) => setBarcode(event.target.value)} label="Nhập mã sản phẩm / barcode" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} />
          <Button variant="contained" onClick={lookupBarcode}>Thêm vào giỏ</Button>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1}>
          {!cameraEnabled
            ? <Button variant="outlined" startIcon={<CameraAltOutlined />} onClick={startCamera}>Mở camera</Button>
            : <Button variant="outlined" color="warning" startIcon={<VideocamOffOutlined />} onClick={stopCamera}>Tắt camera</Button>}
        </Stack>
        {cameraError && <Alert severity="warning" sx={{ mt: 1 }}>{cameraError}</Alert>}
        <Box sx={{ mt: 1, borderRadius: 1, overflow: 'hidden', bgcolor: '#101418' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: 280, display: cameraEnabled ? 'block' : 'none' }} />
          {!cameraEnabled && <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>Camera chưa bật</Box>}
        </Box>
      </Paper>

      <Paper sx={{ p: 2, flex: 1.2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
          <TextField label="customerId" value={customerId} onChange={(event) => setCustomerId(event.target.value)} fullWidth />
          <TextField label="warehouseId" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} fullWidth />
        </Stack>
        <Typography variant="h6" sx={{ mb: 1 }}><ShoppingCartOutlined sx={{ verticalAlign: 'middle', mr: 1 }} />Giỏ hàng</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sản phẩm</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell align="right">SL</TableCell>
              <TableCell align="right">Thành tiền</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map((item) => <TableRow key={item.product.id}>
              <TableCell>{item.product.name}</TableCell>
              <TableCell align="right">{Number(item.product.price || 0).toLocaleString('vi-VN')}</TableCell>
              <TableCell align="right">
                <TextField size="small" type="number" value={item.quantity} onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))} sx={{ width: 80 }} inputProps={{ min: 1 }} />
              </TableCell>
              <TableCell align="right">{(Number(item.product.price || 0) * item.quantity).toLocaleString('vi-VN')}</TableCell>
              <TableCell align="right">
                <IconButton color="error" onClick={() => updateQuantity(item.product.id, 0)}><DeleteOutline /></IconButton>
              </TableCell>
            </TableRow>)}
            {!cart.length && <TableRow><TableCell colSpan={5}>Chưa có sản phẩm trong giỏ.</TableCell></TableRow>}
          </TableBody>
        </Table>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Typography variant="h6">Tổng: {total.toLocaleString('vi-VN')} VND</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<PrintOutlined />} onClick={() => window.print()}>In hóa đơn</Button>
            <Button variant="contained" disabled={isSubmitting || !cart.length} onClick={createOrder}>{isSubmitting ? 'Đang tạo...' : 'Tạo đơn hàng'}</Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  </Box>;
};

export default SalesPos;
