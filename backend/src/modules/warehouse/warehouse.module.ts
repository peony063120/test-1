import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { WAREHOUSE_REPOSITORY } from './repositories/warehouse.repository.interface';
import { WarehouseRepositoryImpl } from './repositories/warehouse.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  controllers: [WarehouseController],
  providers: [
    WarehouseService,
    { provide: WAREHOUSE_REPOSITORY, useClass: WarehouseRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [WarehouseService],
})
export class WarehouseModule {}
