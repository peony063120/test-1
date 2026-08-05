import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowBackOutlined, SaveOutlined } from '@mui/icons-material';
import { Box, Button, FormControlLabel, Grid, Paper, Switch, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useProduct, useProductMutations } from '@/hooks/useProducts';
import type { ProductPayload } from '@/types/product.types';

type ProductFormValues = ProductPayload & { imageUrlsText?: string };
const schema = yup.object({
  name: yup.string().trim().required('Tên sản phẩm là bắt buộc.').max(255).defined(), description: yup.string().optional(), sku: yup.string().optional(), barcode: yup.string().optional(), unit: yup.string().optional(),
  price: yup.number().min(0, 'Giá không được âm.').optional(), costPrice: yup.number().min(0, 'Giá không được âm.').optional(), isActive: yup.boolean().optional(), imageUrls: yup.array(yup.string().url().defined()).optional(), imageUrlsText: yup.string().optional(),
  categoryId: yup.string().uuid('Danh mục không hợp lệ.').optional(), brandId: yup.string().uuid('Thương hiệu không hợp lệ.').optional(), supplierId: yup.string().uuid('Nhà cung cấp không hợp lệ.').optional(),
});

const ProductForm = () => {
  const { id } = useParams(); const isEditing = Boolean(id); const navigate = useNavigate(); const product = useProduct(id); const mutations = useProductMutations();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({ resolver: yupResolver(schema), defaultValues: { name: '', unit: 'Cái', isActive: true } });
  useEffect(() => { if (product.data) reset({ name: product.data.name, description: product.data.description || '', sku: product.data.sku || '', barcode: product.data.barcode || '', unit: product.data.unit || '', price: product.data.price ?? undefined, costPrice: product.data.costPrice ?? undefined, isActive: product.data.isActive ?? true, categoryId: product.data.categoryId || undefined, brandId: product.data.brandId || undefined, supplierId: product.data.supplierId || undefined, imageUrlsText: product.data.imageUrls?.join('\n') || '' }); }, [product.data, reset]);
  const submit = async ({ imageUrlsText, ...values }: ProductFormValues) => {
    const payload: ProductPayload = { ...values, imageUrls: imageUrlsText?.split('\n').map((url) => url.trim()).filter(Boolean) };
    try { if (id) await mutations.update.mutateAsync({ id, payload }); else await mutations.create.mutateAsync(payload); toast.success(isEditing ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm.'); navigate('/products'); } catch { toast.error('Không thể lưu sản phẩm. Vui lòng kiểm tra lại dữ liệu.'); }
  };
  return <Box><Button startIcon={<ArrowBackOutlined />} onClick={() => navigate('/products')} sx={{ mb: 1 }}>Quay lại</Button><Typography variant="h4" gutterBottom>{isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</Typography><Paper sx={{ p: { xs: 2, md: 3 } }} component="form" onSubmit={handleSubmit(submit)}><Grid container spacing={2}>
    <Grid item xs={12} md={6}><TextField {...register('name')} label="Tên sản phẩm" required fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} /></Grid><Grid item xs={12} md={6}><TextField {...register('sku')} label="SKU" fullWidth error={Boolean(errors.sku)} helperText={errors.sku?.message} /></Grid>
    <Grid item xs={12} md={6}><TextField {...register('barcode')} label="Mã vạch" fullWidth /></Grid><Grid item xs={12} md={6}><TextField {...register('unit')} label="Đơn vị" fullWidth /></Grid>
    <Grid item xs={12} md={6}><TextField {...register('costPrice', { valueAsNumber: true })} label="Giá nhập" type="number" fullWidth error={Boolean(errors.costPrice)} helperText={errors.costPrice?.message} /></Grid><Grid item xs={12} md={6}><TextField {...register('price', { valueAsNumber: true })} label="Giá bán" type="number" fullWidth error={Boolean(errors.price)} helperText={errors.price?.message} /></Grid>
    <Grid item xs={12} md={4}><TextField {...register('categoryId')} label="ID danh mục" fullWidth helperText={errors.categoryId?.message || 'Có thể chọn từ danh sách ở phiên bản tiếp theo.'} error={Boolean(errors.categoryId)} /></Grid><Grid item xs={12} md={4}><TextField {...register('brandId')} label="ID thương hiệu" fullWidth error={Boolean(errors.brandId)} helperText={errors.brandId?.message} /></Grid><Grid item xs={12} md={4}><TextField {...register('supplierId')} label="ID nhà cung cấp" fullWidth error={Boolean(errors.supplierId)} helperText={errors.supplierId?.message} /></Grid>
    <Grid item xs={12}><TextField {...register('description')} label="Mô tả" multiline minRows={3} fullWidth /></Grid><Grid item xs={12}><TextField {...register('imageUrlsText')} label="URL ảnh" multiline minRows={2} fullWidth helperText="Mỗi URL trên một dòng." /></Grid>
    <Grid item xs={12}><FormControlLabel control={<Switch defaultChecked {...register('isActive')} />} label="Đang hoạt động" /></Grid><Grid item xs={12}><Button type="submit" variant="contained" startIcon={<SaveOutlined />} disabled={isSubmitting || product.isLoading}>{isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}</Button></Grid>
  </Grid></Paper></Box>;
};
export default ProductForm;
