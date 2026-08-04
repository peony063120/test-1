import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseService } from './warehouse.service';
import { WAREHOUSE_REPOSITORY } from './repositories/warehouse.repository.interface';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';

describe('WarehouseService', () => {
  let service: WarehouseService;
  const repo = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    softDelete: jest.fn(),
    findActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseService,
        { provide: WAREHOUSE_REPOSITORY, useValue: repo },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<WarehouseService>(WarehouseService);
  });

  it('should create a warehouse', async () => {
    repo.findByName.mockResolvedValue(null);
    repo.save.mockResolvedValue({ id: '1', name: 'Central' });

    await expect(service.create({ name: 'Central' } as any)).resolves.toEqual({ id: '1', name: 'Central' });
  });

  it('should throw when duplicate warehouse name', async () => {
    repo.findByName.mockResolvedValue({ id: '1' });

    await expect(service.create({ name: 'Central' } as any)).rejects.toThrow('Warehouse name already exists');
  });
});
