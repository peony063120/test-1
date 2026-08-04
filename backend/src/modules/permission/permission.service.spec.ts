import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { PERMISSION_REPOSITORY } from './repositories/permission.repository.interface';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';

describe('PermissionService', () => {
  let service: PermissionService;
  const repository = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: PERMISSION_REPOSITORY, useValue: repository },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: RedisService, useValue: { del: jest.fn() } },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('creates a permission', async () => {
    repository.findByCode.mockResolvedValue(null);
    repository.save.mockResolvedValue({ id: '1', code: 'user.read', name: 'Read users' });

    const result = await service.create({ code: 'user.read', name: 'Read users' } as any);

    expect(result.code).toBe('user.read');
    expect(repository.save).toHaveBeenCalled();
  });
});
