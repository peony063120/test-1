import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CATEGORY_REPOSITORY } from './repositories/category.repository.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';

describe('CategoryService', () => {
  let service: CategoryService;
  const repository = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    findTree: jest.fn(),
    softDelete: jest.fn(),
    findChildren: jest.fn(),
    findParents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CATEGORY_REPOSITORY, useValue: repository },
        { provide: PrismaService, useValue: { product: { count: jest.fn() } } },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('creates a category successfully', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.save.mockResolvedValue({ id: '1', name: 'Electronics' });

    const result = await service.create({ name: 'Electronics' } as any);

    expect(result.name).toBe('Electronics');
    expect(repository.save).toHaveBeenCalled();
  });

  it('fails on duplicate category name', async () => {
    repository.findByName.mockResolvedValue({ id: '1', name: 'Electronics' });

    await expect(service.create({ name: 'Electronics' } as any)).rejects.toThrow('Category name already exists');
  });

  it('returns not found for missing category', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).resolves.toBeNull();
  });

  it('soft deletes and excludes from findAll', async () => {
    repository.findById.mockResolvedValue({ id: '1', name: 'Electronics' });
    repository.findChildren.mockResolvedValue([]);
    repository.softDelete.mockResolvedValue({ id: '1', name: 'Electronics', deletedAt: new Date() });

    await service.delete('1');

    expect(repository.softDelete).toHaveBeenCalledWith('1');
  });
});
