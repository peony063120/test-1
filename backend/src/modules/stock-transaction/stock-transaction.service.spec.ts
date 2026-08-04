import { Test, TestingModule } from '@nestjs/testing';
import { StockTransactionService } from './stock-transaction.service';
import { STOCK_TRANSACTION_REPOSITORY } from './repositories/stock-transaction.repository.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';

describe('StockTransactionService', () => {
  let service: StockTransactionService;
  const repo = {
    findByInventory: jest.fn(),
    findByProduct: jest.fn(),
    findByReference: jest.fn(),
    findById: jest.fn(),
    getSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockTransactionService,
        { provide: STOCK_TRANSACTION_REPOSITORY, useValue: repo },
        { provide: PrismaService, useValue: { stockTransaction: { create: jest.fn() } } },
        { provide: InventoryService, useValue: {} },
      ],
    }).compile();

    service = module.get<StockTransactionService>(StockTransactionService);
  });

  it('should create transaction', async () => {
    const prisma = { stockTransaction: { create: jest.fn().mockResolvedValue({ id: '1' }) } };
    const serviceWithPrisma = new StockTransactionService(repo as any, prisma as any);
    await expect(serviceWithPrisma.create({ inventoryId: '1' })).resolves.toEqual({ id: '1' });
  });
});
