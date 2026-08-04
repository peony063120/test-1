import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
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
    ProductsModule,
    InventoryModule,
    PurchaseOrdersModule,
    SalesOrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
