import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { AddOutlined, DeleteOutline, EditOutlined } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useResource } from '@/hooks/useResource';
import type { Resource } from '@/api/endpoints/resource.api';

export interface CrudField { name: string; label: string; type?: 'text' | 'email' | 'number'; required?: boolean; }
interface Props<T extends Resource, P extends Record<string, unknown>> { title: string; resourceKey: string; service: Parameters<typeof useResource<T, P>>[1]; fields: CrudField[]; nameOf: (row: T) => string; }
const CrudPage = <T extends Resource, P extends Record<string, unknown>>({ title, resourceKey, service, fields, nameOf }: Props<T, P>) => {
  const [current, setCurrent] = useState<T | null>(null); const [open, setOpen] = useState(false); const data = useResource<T, P>(resourceKey, service); const schema = yup.object(Object.fromEntries(fields.map((field) => [field.name, field.required ? yup.string().required(`${field.label} là bắt buộc.`) : yup.string().optional()])));
  const form = useForm<Record<string, string | undefined>>({ resolver: yupResolver(schema) }); const result = data.list.data; const rows = Array.isArray(result) ? result : result?.items || [];
  const edit = (row?: T) => { setCurrent(row || null); form.reset(row as Record<string, string | undefined> || {}); setOpen(true); };
  const save = async (values: Record<string, string | undefined>) => { try { if (current) await data.update.mutateAsync({ id: current.id, payload: values as Partial<P> }); else await data.create.mutateAsync(values as P); toast.success('Đã lưu dữ liệu.'); setOpen(false); } catch { toast.error('Không thể lưu dữ liệu.'); } };
  const columns: GridColDef<T>[] = [...fields.slice(0, 4).map((field) => ({ field: field.name, headerName: field.label, flex: 1, minWidth: 120 })), { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: ({ row }) => <><IconButton onClick={() => edit(row)}><EditOutlined /></IconButton><IconButton color="error" onClick={() => { if (window.confirm(`Xóa ${nameOf(row)}?`)) data.remove.mutate(row.id, { onSuccess: () => toast.success('Đã xóa.') }); }}><DeleteOutline /></IconButton></> }];
  return <Box><Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h4">{title}</Typography><Button variant="contained" startIcon={<AddOutlined />} onClick={() => edit()}>Thêm mới</Button></Stack><Paper sx={{ p: 2 }}><DataGrid autoHeight loading={data.list.isLoading} rows={rows} columns={columns} disableRowSelectionOnClick /></Paper><Dialog fullWidth maxWidth="sm" open={open} onClose={() => setOpen(false)}><Box component="form" onSubmit={form.handleSubmit(save)}><DialogTitle>{current ? 'Cập nhật' : 'Thêm mới'} {title.toLowerCase()}</DialogTitle><DialogContent>{fields.map((field) => <TextField key={field.name} {...form.register(field.name)} label={field.label} type={field.type} required={field.required} fullWidth margin="dense" error={Boolean(form.formState.errors[field.name])} helperText={form.formState.errors[field.name]?.message} />)}</DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" variant="contained">Lưu</Button></DialogActions></Box></Dialog></Box>;
};
export default CrudPage;
