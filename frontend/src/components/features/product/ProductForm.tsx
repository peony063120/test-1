import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowBackOutlined, CameraAltOutlined, ClearAllOutlined, ImageOutlined, SaveOutlined, SearchOutlined, VideocamOffOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useProduct, useProductMutations } from '@/hooks/useProducts';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import type { ProductPayload } from '@/types/product.types';

type ProductFormValues = ProductPayload & { imageUrlsText?: string };

const schema: yup.ObjectSchema<ProductFormValues> = yup.object({
  name: yup.string().trim().required('Tên sản phẩm là bắt buộc.').max(255).defined(),
  description: yup.string().optional(),
  sku: yup.string().optional(),
  barcode: yup.string().optional(),
  unit: yup.string().optional(),
  price: yup.number().min(0, 'Giá không được âm.').optional(),
  costPrice: yup.number().min(0, 'Giá không được âm.').optional(),
  isActive: yup.boolean().optional(),
  imageUrls: yup.array(yup.string().url().defined()).optional(),
  imageUrlsText: yup.string().optional(),
  categoryId: yup.string().uuid('Danh mục không hợp lệ.').optional(),
  brandId: yup.string().uuid('Thương hiệu không hợp lệ.').optional(),
  supplierId: yup.string().uuid('Nhà cung cấp không hợp lệ.').optional(),
});

const splitImageUrls = (value?: string) => (value || '')
  .split('\n')
  .map((url) => url.trim())
  .filter(Boolean);

const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const ProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const product = useProduct(id);
  const mutations = useProductMutations();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', unit: 'Cái', isActive: true, imageUrlsText: '' },
  });

  const imageUrlsText = watch('imageUrlsText') || '';
  const remoteImageUrls = useMemo(() => splitImageUrls(imageUrlsText), [imageUrlsText]);

  const handleBarcodeDetected = useCallback((barcode: string) => {
    setValue('barcode', barcode, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    toast.success(`Đã quét barcode ${barcode}.`);
  }, [setValue]);

  const { videoRef, cameraEnabled, cameraError, startCamera, stopCamera } = useBarcodeScanner({
    onDetected: handleBarcodeDetected,
  });

  useEffect(() => {
    if (!product.data) {
      return;
    }

    reset({
      name: product.data.name,
      description: product.data.description || '',
      sku: product.data.sku || '',
      barcode: product.data.barcode || '',
      unit: product.data.unit || '',
      price: product.data.price ?? undefined,
      costPrice: product.data.costPrice ?? undefined,
      isActive: product.data.isActive ?? true,
      categoryId: product.data.categoryId || undefined,
      brandId: product.data.brandId || undefined,
      supplierId: product.data.supplierId || undefined,
      imageUrlsText: product.data.imageUrls?.join('\n') || '',
    });
    setSelectedImages([]);
  }, [product.data, reset]);

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    const imageUrls = await Promise.all(Array.from(files).map((file) => fileToDataUrl(file)));
    setSelectedImages((current) => [...current, ...imageUrls]);
    event.target.value = '';
  }, []);

  const removeImportedImage = useCallback((index: number) => {
    setSelectedImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }, []);

  const submit = async ({ imageUrlsText: urlsText, ...values }: ProductFormValues) => {
    const imageUrls = [...splitImageUrls(urlsText), ...selectedImages];
    const payload: ProductPayload = {
      ...values,
      imageUrls: imageUrls.length ? imageUrls : undefined,
    };

    try {
      if (id) {
        await mutations.update.mutateAsync({ id, payload });
      } else {
        await mutations.create.mutateAsync(payload);
      }
      toast.success(isEditing ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm.');
      navigate('/products');
    } catch {
      toast.error('Không thể lưu sản phẩm. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  const previewImages = [...remoteImageUrls, ...selectedImages];

  return <Box>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Button startIcon={<ArrowBackOutlined />} onClick={() => navigate('/products')}>Quay lại</Button>
      <Chip label={isEditing ? 'Chỉnh sửa' : 'Tạo mới'} color="primary" variant="outlined" />
    </Stack>
    <Typography variant="h4" gutterBottom>{isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>
      Có thể quét barcode bằng camera hoặc nhập tay. Ảnh sản phẩm được hiển thị ngay trong form để kiểm tra trước khi lưu.
    </Typography>

    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: { xs: 2, md: 3 } }} component="form" onSubmit={handleSubmit(submit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField {...register('name')} label="Tên sản phẩm" required fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} /></Grid>
            <Grid item xs={12} md={6}><TextField {...register('sku')} label="SKU" fullWidth error={Boolean(errors.sku)} helperText={errors.sku?.message} /></Grid>
            <Grid item xs={12} md={6}><TextField {...register('barcode')} label="Mã vạch" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} /></Grid>
            <Grid item xs={12} md={6}><TextField {...register('unit')} label="Đơn vị" fullWidth /></Grid>
            <Grid item xs={12} md={6}><TextField {...register('costPrice', { valueAsNumber: true })} label="Giá nhập" type="number" fullWidth error={Boolean(errors.costPrice)} helperText={errors.costPrice?.message} /></Grid>
            <Grid item xs={12} md={6}><TextField {...register('price', { valueAsNumber: true })} label="Giá bán" type="number" fullWidth error={Boolean(errors.price)} helperText={errors.price?.message} /></Grid>
            <Grid item xs={12} md={4}><TextField {...register('categoryId')} label="ID danh mục" fullWidth helperText={errors.categoryId?.message || 'Có thể chọn từ danh sách ở phiên bản tiếp theo.'} error={Boolean(errors.categoryId)} /></Grid>
            <Grid item xs={12} md={4}><TextField {...register('brandId')} label="ID thương hiệu" fullWidth error={Boolean(errors.brandId)} helperText={errors.brandId?.message} /></Grid>
            <Grid item xs={12} md={4}><TextField {...register('supplierId')} label="ID nhà cung cấp" fullWidth error={Boolean(errors.supplierId)} helperText={errors.supplierId?.message} /></Grid>
            <Grid item xs={12}><TextField {...register('description')} label="Mô tả" multiline minRows={3} fullWidth /></Grid>
            <Grid item xs={12}><TextField {...register('imageUrlsText')} label="URL ảnh / data URL" multiline minRows={3} fullWidth helperText="Mỗi dòng một ảnh. Ảnh từ file chọn phía dưới sẽ được thêm vào danh sách xem trước." /></Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={Boolean(field.value)} onChange={(_, checked) => field.onChange(checked)} />}
                    label="Đang hoạt động"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                <Button variant="outlined" component="label" startIcon={<ImageOutlined />}>
                  Chọn ảnh sản phẩm
                  <input hidden accept="image/*" multiple type="file" onChange={(event) => void handleFileChange(event)} />
                </Button>
                <Button variant="outlined" color="warning" startIcon={<ClearAllOutlined />} onClick={() => setSelectedImages([])}>
                  Xóa ảnh đã chọn
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                {!cameraEnabled
                  ? <Button variant="outlined" startIcon={<CameraAltOutlined />} onClick={() => void startCamera()}>Quét barcode bằng camera</Button>
                  : <Button variant="outlined" color="warning" startIcon={<VideocamOffOutlined />} onClick={stopCamera}>Tắt camera</Button>}
              </Stack>
              {cameraError && <Alert severity="warning" sx={{ mb: 1 }}>{cameraError}</Alert>}
              <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#0f172a' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', minHeight: 240, display: cameraEnabled ? 'block' : 'none' }} />
                {!cameraEnabled && <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>Camera chưa bật</Box>}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" startIcon={<SaveOutlined />} disabled={isSubmitting || product.isLoading}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 2.5, height: '100%' }}>
          <Typography variant="h6" gutterBottom>Xem trước ảnh sản phẩm</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Các ảnh đã nhập từ URL hoặc file cục bộ sẽ hiển thị ở đây.
          </Typography>
          <Stack spacing={1.5}>
            {previewImages.length
              ? previewImages.map((imageUrl, index) => <Card key={`${imageUrl}-${index}`} variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box component="img" src={imageUrl} alt={`Ảnh ${index + 1}`} sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Ảnh {index + 1}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{imageUrl}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>)
              : <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>Chưa có ảnh để hiển thị.</Box>}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </Box>;
};

export default ProductForm;
