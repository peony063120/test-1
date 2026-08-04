import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PERMISSION_REPOSITORY } from './repositories/permission.repository.interface';
import { PermissionRepositoryImpl } from './repositories/permission.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    { provide: PERMISSION_REPOSITORY, useClass: PermissionRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [PermissionService, PERMISSION_REPOSITORY],
})
export class PermissionModule {}
