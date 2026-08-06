import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { GuardsModule } from '../../infrastructure/guards/guards.module';
import { SystemSettingController } from './system-setting.controller';
import { SystemSettingService } from './system-setting.service';
import { SYSTEM_SETTING_REPOSITORY } from './repositories/system-setting.repository.interface';
import { SystemSettingRepositoryImpl } from './repositories/system-setting.repository.impl';

@Module({
  imports: [PrismaModule, GuardsModule],
  controllers: [SystemSettingController],
  providers: [
    SystemSettingService,
    { provide: SYSTEM_SETTING_REPOSITORY, useClass: SystemSettingRepositoryImpl },
  ],
  exports: [SystemSettingService],
})
export class SystemSettingModule {}
