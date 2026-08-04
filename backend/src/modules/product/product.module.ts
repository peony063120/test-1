import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from './repositories/product.repository.interface';
import { ProductRepositoryImpl } from './repositories/product.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [ProductService, PRODUCT_REPOSITORY],
})
export class ProductModule {}
