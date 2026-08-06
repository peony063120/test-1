import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SUPPLIER_REPOSITORY } from './repositories/supplier.repository.interface';
import { SupplierRepositoryImpl } from './repositories/supplier.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  controllers: [SupplierController],
  providers: [
    SupplierService,
    { provide: SUPPLIER_REPOSITORY, useClass: SupplierRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [SupplierService, SUPPLIER_REPOSITORY],
})
export class SupplierModule {}
