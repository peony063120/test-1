import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { PURCHASE_ORDER_REPOSITORY } from './repositories/purchase-order.repository.interface';
import { PurchaseOrderRepositoryImpl } from './repositories/purchase-order.repository.impl';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductModule } from '../product/product.module';
import { SupplierModule } from '../supplier/supplier.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { UserModule } from '../user/user.module';
import { PurchaseDetailModule } from '../purchase-detail/purchase-detail.module';

@Module({
  imports: [PrismaModule, LoggerModule, InventoryModule, ProductModule, SupplierModule, WarehouseModule, UserModule, PurchaseDetailModule],
  controllers: [PurchaseOrderController],
  providers: [
    PurchaseOrderService,
    { provide: PURCHASE_ORDER_REPOSITORY, useClass: PurchaseOrderRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
