import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SYSTEM_SETTING_REPOSITORY, ISystemSettingRepository } from './repositories/system-setting.repository.interface';

const DEFAULT_SYSTEM_SETTINGS: Array<{ key: string; value: string }> = [
  { key: 'system.name', value: 'Product Management System' },
  { key: 'system.timezone', value: 'Asia/Ho_Chi_Minh' },
  { key: 'system.currency', value: 'VND' },
  { key: 'inventory.lowStockThreshold', value: '10' },
  { key: 'sales.vatRate', value: '8' },
];

@Injectable()
export class SystemSettingService {
  constructor(@Inject(SYSTEM_SETTING_REPOSITORY) private readonly systemSettingRepository: ISystemSettingRepository) {}

  async get(key: string) {
    return this.systemSettingRepository.findByKey(key);
  }

  async set(key: string, value: any) {
    const existing = await this.systemSettingRepository.findByKey(key);
    if (existing) {
      return this.systemSettingRepository.update(key, value);
    }
    return this.systemSettingRepository.save({ key, value });
  }

  async findAll() {
    const settings = await this.systemSettingRepository.findAll();
    if (settings.length > 0) {
      return settings;
    }

    for (const setting of DEFAULT_SYSTEM_SETTINGS) {
      await this.systemSettingRepository.save(setting);
    }

    return this.systemSettingRepository.findAll();
  }

  async delete(key: string) {
    const existing = await this.systemSettingRepository.findByKey(key);
    if (!existing) throw new NotFoundException('System setting not found');
    await this.systemSettingRepository.delete(key);
    return { success: true };
  }

  async getDefault() {
    return this.systemSettingRepository.findAll();
  }
}
