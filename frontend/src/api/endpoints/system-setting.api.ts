import api from '@/api/axios.config';
export interface SystemSetting { key: string; value: string; }
export const systemSettingApi = { list: async () => (await api.get<SystemSetting[]>('/system-settings')).data, update: async (key: string, value: string) => (await api.put<SystemSetting>(`/system-settings/${key}`, { value })).data };
