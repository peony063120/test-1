import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
    jest.clearAllMocks();
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

  it('rejects circular parent references', async () => {
    repository.findById.mockResolvedValue({ id: '1', parentId: '2' });
    await expect(service.update('1', { parentId: '1' } as any)).rejects.toThrow(BadRequestException);
  });

  it('throws when deleting missing category', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.delete('missing')).rejects.toThrow(NotFoundException);
  });

  it('builds a category tree', async () => {
    repository.findTree.mockResolvedValue([{ id: '1', parentId: null }, { id: '2', parentId: '1' }]);
    const tree = await service.getTree();
    expect(tree).toHaveLength(1);
  });
});
