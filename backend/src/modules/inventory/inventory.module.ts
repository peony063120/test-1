import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { INVENTORY_REPOSITORY } from './repositories/inventory.repository.interface';
import { InventoryRepositoryImpl } from './repositories/inventory.repository.impl';
import { StockTransactionModule } from '../stock-transaction/stock-transaction.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { ProductModule } from '../product/product.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, LoggerModule, StockTransactionModule, WarehouseModule, ProductModule, AuthModule],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    { provide: INVENTORY_REPOSITORY, useClass: InventoryRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
