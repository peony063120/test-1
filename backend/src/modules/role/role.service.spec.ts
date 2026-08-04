import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { ROLE_REPOSITORY } from './repositories/role.repository.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';

describe('RoleService', () => {
  let service: RoleService;
  const repository = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: ROLE_REPOSITORY, useValue: repository },
        { provide: PrismaService, useValue: { rolePermission: { deleteMany: jest.fn(), createMany: jest.fn() } } },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: RedisService, useValue: { del: jest.fn() } },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('creates a role', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.save.mockResolvedValue({ id: '1', name: 'admin' });

    const result = await service.create({ name: 'admin' } as any);

    expect(result.name).toBe('admin');
    expect(repository.save).toHaveBeenCalled();
  });
});
