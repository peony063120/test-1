import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { inventoryApi } from '@/api/endpoints/inventory.api';

interface Values { quantity: number; reason?: string; }
const schema: yup.ObjectSchema<Values> = yup.object({ quantity: yup.number().notOneOf([0], 'Số lượng không được bằng 0.').required().defined(), reason: yup.string().optional() });
const InventoryAdjust = () => { const { id } = useParams(); const navigate = useNavigate(); const client = useQueryClient(); const form = useForm<Values>({ resolver: yupResolver(schema) }); const mutation = useMutation({ mutationFn: (values: Values) => inventoryApi.adjust(id!, values), onSuccess: () => client.invalidateQueries({ queryKey: ['inventories'] }) });
  const submit = async (values: Values) => { try { await mutation.mutateAsync(values); toast.success('Đã điều chỉnh tồn kho.'); navigate('/inventories'); } catch { toast.error('Không thể điều chỉnh tồn kho.'); } };
  return <Box><Typography variant="h4" gutterBottom>Điều chỉnh tồn kho</Typography><Paper component="form" onSubmit={form.handleSubmit(submit)} sx={{ p: 3, maxWidth: 520 }}><TextField {...form.register('quantity', { valueAsNumber: true })} label="Số lượng điều chỉnh" type="number" fullWidth error={Boolean(form.formState.errors.quantity)} helperText={form.formState.errors.quantity?.message || 'Dương: nhập thêm, âm: xuất bớt.'} /><TextField {...form.register('reason')} label="Lý do" fullWidth margin="normal" multiline minRows={3} /><Button type="submit" variant="contained" disabled={mutation.isPending}>Xác nhận</Button></Paper></Box>;
};
export default InventoryAdjust;
