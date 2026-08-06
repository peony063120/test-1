import api from '@/api/axios.config';

export interface SystemSetting {
  key: string;
  value: string;
  dataType?: string;
  description?: string;
}

export const systemSettingApi = {
  list: async () => (await api.get<SystemSetting[]>('/system-settings')).data,
  create: async (payload: { key: string; value: string }) =>
    (await api.post<SystemSetting>('/system-settings', payload)).data,
  update: async (key: string, value: string) =>
    (await api.put<SystemSetting>(`/system-settings/${key}`, { value })).data,
  delete: async (key: string) =>
    (await api.delete(`/system-settings/${key}`)).data,
};
