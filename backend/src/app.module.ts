import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { ProductsModule } from './products/products.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { CategoryModule } from './modules/category/category.module';
import { BrandModule } from './modules/brand/brand.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { ProductModule } from './modules/product/product.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { StockTransactionModule } from './modules/stock-transaction/stock-transaction.module';
import { CustomerModule } from './modules/customer/customer.module';
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { PurchaseDetailModule } from './modules/purchase-detail/purchase-detail.module';
import { SalesOrderModule } from './modules/sales-order/sales-order.module';
import { SalesDetailModule } from './modules/sales-detail/sales-detail.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { SystemSettingModule } from './modules/system-setting/system-setting.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { SearchModule } from './modules/search/search.module';
import { ReportModule } from './modules/report/report.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { WorkerModule } from './workers/worker.module';
import { StorageModule } from './infrastructure/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    LoggerModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    CategoryModule,
    BrandModule,
    SupplierModule,
    ProductModule,
    WarehouseModule,
    InventoryModule,
    StockTransactionModule,
    CustomerModule,
    PurchaseOrderModule,
    PurchaseDetailModule,
    SalesOrderModule,
    SalesDetailModule,
    NotificationModule,
    AuditLogModule,
    SystemSettingModule,
    FileUploadModule,
    SearchModule,
    ReportModule,
    DashboardModule,
    QueueModule,
    WorkerModule,
    StorageModule,
    ProductsModule,
    PurchaseOrdersModule,
    SalesOrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
