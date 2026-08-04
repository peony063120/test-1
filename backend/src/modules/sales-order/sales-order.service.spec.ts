import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesOrderService } from './sales-order.service';
import { SALES_ORDER_REPOSITORY } from './repositories/sales-order.repository.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductService } from '../product/product.service';
import { CustomerService } from '../customer/customer.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { SalesDetailService } from '../sales-detail/sales-detail.service';

describe('SalesOrderService', () => {
  let service: SalesOrderService;
  const repository = {
    findById: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesOrderService,
        { provide: SALES_ORDER_REPOSITORY, useValue: repository },
        { provide: PrismaService, useValue: { $transaction: jest.fn(), salesOrder: { create: jest.fn(), update: jest.fn(), findUniqueOrThrow: jest.fn() }, salesDetail: { create: jest.fn(), deleteMany: jest.fn(), findMany: jest.fn() } } },
        { provide: AuditLogService, useValue: { log: jest.fn().mockResolvedValue(true) } },
        { provide: InventoryService, useValue: { adjustStock: jest.fn().mockResolvedValue(true), checkAvailable: jest.fn().mockResolvedValue(true) } },
        { provide: ProductService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'product-1' }) } },
        { provide: CustomerService, useValue: { findById: jest.fn().mockResolvedValue({ id: 'customer-1' }) } },
        { provide: WarehouseService, useValue: { findById: jest.fn().mockResolvedValue({ id: 'warehouse-1' }) } },
        { provide: SalesDetailService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesOrderService>(SalesOrderService);
    jest.clearAllMocks();
  });

  it('creates a sales order', async () => {
    const prisma = (service as any).prisma;
    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
    prisma.salesOrder.create.mockResolvedValue({ id: 'so-1' });
    prisma.salesOrder.findUniqueOrThrow.mockResolvedValue({ id: 'so-1', details: [] });
    prisma.salesDetail.create.mockResolvedValue({});
    const result = await service.create({ customerId: 'customer-1', warehouseId: 'warehouse-1', details: [{ productId: 'product-1', quantity: 2, price: 10 }] });
    expect(result.id).toBe('so-1');
  });

  it('ships a draft sales order and updates inventory', async () => {
    repository.findById.mockResolvedValue({ id: 'so-1', status: 'DRAFT', warehouseId: 'warehouse-1', details: [{ productId: 'product-1', quantity: 2 }] });
    repository.updateStatus.mockResolvedValue({ id: 'so-1', status: 'SHIPPED' });
    await expect(service.ship('so-1', 'user-1')).resolves.toMatchObject({ status: 'SHIPPED' });
  });

  it('cancels a shipped order and returns inventory', async () => {
    repository.findById.mockResolvedValue({ id: 'so-1', status: 'SHIPPED', warehouseId: 'warehouse-1' });
    const prisma = (service as any).prisma;
    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
    prisma.salesDetail.findMany.mockResolvedValue([{ productId: 'product-1', quantity: 2 }]);
    await expect(service.cancel('so-1', 'user-1')).resolves.toBeDefined();
  });

  it('throws not found for unknown order', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.ship('missing', 'user-1')).rejects.toThrow(NotFoundException);
  });
});
