import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { InventoryModule } from '../inventory/inventory.module';
import { SalesOrderModule } from '../sales-order/sales-order.module';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';
import { ProductModule } from '../product/product.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [InventoryModule, SalesOrderModule, PurchaseOrderModule, ProductModule, AuthModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
