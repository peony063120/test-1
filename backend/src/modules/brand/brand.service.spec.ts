import { Test, TestingModule } from '@nestjs/testing';
import { BrandService } from './brand.service';
import { BRAND_REPOSITORY } from './repositories/brand.repository.interface';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';

describe('BrandService', () => {
  let service: BrandService;
  const repository = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        { provide: BRAND_REPOSITORY, useValue: repository },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
  });

  it('creates a brand successfully', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.save.mockResolvedValue({ id: '1', name: 'Apple' });

    const result = await service.create({ name: 'Apple' } as any);

    expect(result.name).toBe('Apple');
    expect(repository.save).toHaveBeenCalled();
  });

  it('fails on duplicate brand name', async () => {
    repository.findByName.mockResolvedValue({ id: '1', name: 'Apple' });

    await expect(service.create({ name: 'Apple' } as any)).rejects.toThrow('Brand name already exists');
  });

  it('returns not found for missing brand', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).resolves.toBeNull();
  });
});
