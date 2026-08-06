import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { ROLE_REPOSITORY } from './repositories/role.repository.interface';
import { RoleRepositoryImpl } from './repositories/role.repository.impl';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  controllers: [RoleController],
  providers: [
    RoleService,
    { provide: ROLE_REPOSITORY, useClass: RoleRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [RoleService, ROLE_REPOSITORY],
})
export class RoleModule {}
