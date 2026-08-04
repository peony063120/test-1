export const SYSTEM_SETTING_REPOSITORY = Symbol('SYSTEM_SETTING_REPOSITORY');

export interface ISystemSettingRepository {
  save(data: any): Promise<any>;
  update(key: string, value: any): Promise<any>;
  findByKey(key: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  delete(key: string): Promise<void>;
}
