import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { AUDIT_LOG_REPOSITORY } from './repositories/audit-log.repository.interface';
import { AuditLogRepositoryImpl } from './repositories/audit-log.repository.impl';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    { provide: AUDIT_LOG_REPOSITORY, useClass: AuditLogRepositoryImpl },
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
