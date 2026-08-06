import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Tooltip,
  Chip,
  MenuItem,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemSettingApi, SystemSetting } from '@/api/endpoints/system-setting.api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const DATA_TYPES = [
  { value: 'STRING', label: 'Văn bản' },
  { value: 'NUMBER', label: 'Số' },
  { value: 'BOOLEAN', label: 'Có/Không' },
];

const SystemSettings = () => {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDataType, setNewDataType] = useState('STRING');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['system-settings'],
    queryFn: systemSettingApi.list,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      systemSettingApi.update(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system-settings'] }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { key: string; value: string }) =>
      systemSettingApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Đã thêm cấu hình mới.');
      setAddOpen(false);
      setNewKey('');
      setNewValue('');
      setNewDataType('STRING');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể thêm cấu hình.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => systemSettingApi.delete(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Đã xóa cấu hình.');
    },
  });

  const handleAdd = () => {
    if (!newKey.trim()) { toast.error('Vui lòng nhập key.'); return; }
    createMutation.mutate({ key: newKey.trim(), value: newValue });
  };

  // Group settings by category
  const groupLabel = (key: string) => {
    if (['siteName', 'language', 'timezone', 'currency', 'itemsPerPage', 'enableBarcode', 'enableNotification', 'autoLogoutMinutes'].includes(key))
      return 'Chung';
    if (['companyName', 'companyAddress', 'companyPhone', 'companyEmail', 'taxRate'].includes(key))
      return 'Công ty';
    if (['lowStockThreshold', 'defaultWarehouse'].includes(key))
      return 'Kho';
    return 'Khác';
  };

  const settings = data || [];
  const grouped = settings.reduce<Record<string, SystemSetting[]>>((acc, s) => {
    const g = groupLabel(s.key);
    (acc[g] ??= []).push(s);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={8}>
        <Typography color="error">Không thể tải cấu hình hệ thống.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => queryClient.invalidateQueries({ queryKey: ['system-settings'] })}>
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Cấu hình hệ thống</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>
          Thêm cấu hình
        </Button>
      </Stack>

      {settings.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary" mb={2}>
            Chưa có cấu hình hệ thống nào. Hãy chạy seed hoặc thêm thủ công.
          </Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setAddOpen(true)}>
            Thêm cấu hình đầu tiên
          </Button>
        </Paper>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <Box key={group} mb={3}>
            <Typography variant="subtitle1" fontWeight={600} color="primary" mb={1}>
              {group}
            </Typography>
            <Stack spacing={1.5}>
              {items.map((setting) => (
                <Paper key={setting.key} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                      <Typography fontWeight={500}>{setting.key}</Typography>
                      {setting.dataType && (
                        <Chip label={DATA_TYPES.find(d => d.value === setting.dataType)?.label || setting.dataType} size="small" variant="outlined" />
                      )}
                    </Stack>
                    {setting.description && (
                      <Typography variant="caption" color="text.secondary">
                        {setting.description}
                      </Typography>
                    )}
                  </Box>
                  <TextField
                    size="small"
                    defaultValue={setting.value}
                    sx={{ minWidth: 200 }}
                    onBlur={(event) => {
                      if (event.target.value !== setting.value) {
                        updateMutation.mutate(
                          { key: setting.key, value: event.target.value },
                          { onSuccess: () => toast.success('Đã lưu cài đặt.') },
                        );
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
                    }}
                  />
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (window.confirm(`Xóa cấu hình "${setting.key}"?`)) {
                          deleteMutation.mutate(setting.key);
                        }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              ))}
            </Stack>
          </Box>
        ))
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm cấu hình mới</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Key"
              placeholder="vd: siteName"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              fullWidth
            />
            <TextField
              label="Giá trị"
              placeholder="Nhập giá trị..."
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              fullWidth
              multiline
            />
            <TextField
              select
              label="Kiểu dữ liệu"
              value={newDataType}
              onChange={(e) => setNewDataType(e.target.value)}
              fullWidth
            >
              {DATA_TYPES.map((dt) => (
                <MenuItem key={dt.value} value={dt.value}>{dt.label}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleAdd} disabled={createMutation.isPending}>
            {createMutation.isPending ? <CircularProgress size={20} /> : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings;
