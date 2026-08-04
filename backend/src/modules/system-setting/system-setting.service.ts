import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SYSTEM_SETTING_REPOSITORY, ISystemSettingRepository } from './repositories/system-setting.repository.interface';

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
