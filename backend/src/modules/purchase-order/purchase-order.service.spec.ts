import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderService } from './purchase-order.service';
import { PURCHASE_ORDER_REPOSITORY } from './repositories/purchase-order.repository.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductService } from '../product/product.service';
import { SupplierService } from '../supplier/supplier.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { PurchaseDetailService } from '../purchase-detail/purchase-detail.service';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  const repository = {
    findById: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderService,
        { provide: PURCHASE_ORDER_REPOSITORY, useValue: repository },
        { provide: PrismaService, useValue: { $transaction: jest.fn(), purchaseOrder: { create: jest.fn(), update: jest.fn(), findUniqueOrThrow: jest.fn() }, purchaseDetail: { create: jest.fn(), deleteMany: jest.fn() } } },
        { provide: AuditLogService, useValue: { log: jest.fn().mockResolvedValue(true) } },
        { provide: InventoryService, useValue: { adjustStock: jest.fn().mockResolvedValue(true) } },
        { provide: ProductService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'product-1' }) } },
        { provide: SupplierService, useValue: { findById: jest.fn().mockResolvedValue({ id: 'supplier-1' }) } },
        { provide: WarehouseService, useValue: { findById: jest.fn().mockResolvedValue({ id: 'warehouse-1' }) } },
        { provide: PurchaseDetailService, useValue: {} },
      ],
    }).compile();

    service = module.get<PurchaseOrderService>(PurchaseOrderService);
    jest.clearAllMocks();
  });

  it('creates a purchase order', async () => {
    const prisma = (service as any).prisma;
    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
    prisma.purchaseOrder.create.mockResolvedValue({ id: 'po-1' });
    prisma.purchaseOrder.findUniqueOrThrow.mockResolvedValue({ id: 'po-1', details: [] });
    prisma.purchaseDetail.create.mockResolvedValue({});

    const result = await service.create({ supplierId: 'supplier-1', warehouseId: 'warehouse-1', details: [{ productId: 'product-1', quantity: 2, price: 10 }] });
    expect(result.id).toBe('po-1');
  });
});
