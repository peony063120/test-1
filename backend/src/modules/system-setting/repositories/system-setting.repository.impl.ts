import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ISystemSettingRepository } from './system-setting.repository.interface';

@Injectable()
export class SystemSettingRepositoryImpl implements ISystemSettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: any) {
    return this.prisma.systemSetting.create({ data });
  }

  async update(key: string, value: any) {
    return this.prisma.systemSetting.update({ where: { key }, data: { value: String(value) } });
  }

  async findByKey(key: string) {
    return this.prisma.systemSetting.findUnique({ where: { key } });
  }

  async findAll() {
    return this.prisma.systemSetting.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async delete(key: string) {
    await this.prisma.systemSetting.delete({ where: { key } });
  }
}
