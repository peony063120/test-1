import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from './repositories/product.repository.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';

describe('ProductService', () => {
  let service: ProductService;

  const repo = {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: repo },
        { provide: PrismaService, useValue: { product: { findFirst: jest.fn() } } },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: RedisService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto = { name: 'Widget' };
    repo.create.mockResolvedValue({ id: '1', name: 'Widget' });

    await expect(service.create(dto as any)).resolves.toEqual({ id: '1', name: 'Widget' });
  });
});
