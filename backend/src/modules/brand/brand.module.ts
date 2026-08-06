import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BRAND_REPOSITORY } from './repositories/brand.repository.interface';
import { BrandRepositoryImpl } from './repositories/brand.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  controllers: [BrandController],
  providers: [
    BrandService,
    { provide: BRAND_REPOSITORY, useClass: BrandRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [BrandService, BRAND_REPOSITORY],
})
export class BrandModule {}
