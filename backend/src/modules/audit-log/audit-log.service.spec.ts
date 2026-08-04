import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { AUDIT_LOG_REPOSITORY } from './repositories/audit-log.repository.interface';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: { save: jest.Mock; findById: jest.Mock; findByUser: jest.Mock; findByEntity: jest.Mock; findAll: jest.Mock };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      findByEntity: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLogService, { provide: AUDIT_LOG_REPOSITORY, useValue: repository }],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('logs an action', async () => {
    repository.save.mockResolvedValue({ id: 'a1' });
    await expect(service.log('u1', 'CREATE', 'product', 'p1', null, { ok: true }, '127.0.0.1')).resolves.toEqual({ id: 'a1' });
  });

  it('finds logs by entity', async () => {
    repository.findByEntity.mockResolvedValue([{ id: 'a1' }]);
    await expect(service.findByEntity('product', 'p1')).resolves.toEqual([{ id: 'a1' }]);
  });
});
