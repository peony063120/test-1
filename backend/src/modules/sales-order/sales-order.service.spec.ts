import { Test, TestingModule } from '@nestjs/testing';
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
});
