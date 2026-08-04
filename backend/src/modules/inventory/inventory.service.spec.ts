import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { INVENTORY_REPOSITORY } from './repositories/inventory.repository.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { StockTransactionService } from '../stock-transaction/stock-transaction.service';

describe('InventoryService', () => {
  let service: InventoryService;
  const repo = {
    findByProductAndWarehouse: jest.fn(),
    findByProduct: jest.fn(),
    findByWarehouse: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findLowStock: jest.fn(),
    findOverStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: INVENTORY_REPOSITORY, useValue: repo },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(async (fn: any) => fn({
              inventory: {
                findUnique: jest.fn().mockResolvedValue({ id: '1', quantity: 5 }),
                update: jest.fn().mockResolvedValue({ id: '1', quantity: -5 }),
              },
              stockTransaction: { create: jest.fn() },
            })),
          },
        },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: RedisService, useValue: { del: jest.fn() } },
        { provide: StockTransactionService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should create inventory', async () => {
    repo.findByProductAndWarehouse.mockResolvedValue(null);
    repo.save.mockResolvedValue({ id: '1', quantity: 10 });

    await expect(service.create({ productId: '1', warehouseId: '1', quantity: 10, minimumQuantity: 0, maximumQuantity: 100 } as any)).resolves.toEqual({ id: '1', quantity: 10 });
  });

  it('should throw when stock insufficient', async () => {
    repo.findByProductAndWarehouse.mockResolvedValue({ id: '1', productId: '1', warehouseId: '1', quantity: 5 });
    await expect(service.adjustStock('1', '1', -10, 'EXPORT', 'ref', '1')).rejects.toThrow('Insufficient stock');
  });
});
