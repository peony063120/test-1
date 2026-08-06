import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CUSTOMER_REPOSITORY } from './repositories/customer.repository.interface';
import { CustomerRepositoryImpl } from './repositories/customer.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [CustomerService, CUSTOMER_REPOSITORY],
})
export class CustomerModule {}
