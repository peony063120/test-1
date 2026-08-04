import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { SalesOrderController } from './sales-order.controller';
import { SalesOrderService } from './sales-order.service';
import { SALES_ORDER_REPOSITORY } from './repositories/sales-order.repository.interface';
import { SalesOrderRepositoryImpl } from './repositories/sales-order.repository.impl';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductModule } from '../product/product.module';
import { CustomerModule } from '../customer/customer.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { UserModule } from '../user/user.module';
import { SalesDetailModule } from '../sales-detail/sales-detail.module';

@Module({
  imports: [PrismaModule, LoggerModule, InventoryModule, ProductModule, CustomerModule, WarehouseModule, UserModule, SalesDetailModule],
  controllers: [SalesOrderController],
  providers: [
    SalesOrderService,
    { provide: SALES_ORDER_REPOSITORY, useClass: SalesOrderRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [SalesOrderService],
})
export class SalesOrderModule {}
