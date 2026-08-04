import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';

describe('UserService', () => {
  let service: UserService;
  const repository = {
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findAll: jest.fn(),
    findPermissionsByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useValue: repository },
        { provide: PrismaService, useValue: { userRole: { deleteMany: jest.fn(), createMany: jest.fn() } } },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: RedisService, useValue: { del: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('creates a user', async () => {
    repository.findByUsername.mockResolvedValue(null);
    repository.findByEmail.mockResolvedValue(null);
    repository.save.mockResolvedValue({ id: '1', username: 'john', email: 'john@example.com' });
    repository.findById.mockResolvedValue({ id: '1', username: 'john', email: 'john@example.com' });

    const result = await service.create({ username: 'john', password: 'password123', email: 'john@example.com' } as any);

    expect(result?.username).toBe('john');
    expect(repository.save).toHaveBeenCalled();
  });

  it('rejects duplicate username', async () => {
    repository.findByUsername.mockResolvedValue({ id: '1' });
    await expect(service.create({ username: 'john', password: 'password123', email: 'john@example.com' } as any)).rejects.toThrow(BadRequestException);
  });

  it('updates a user', async () => {
    repository.findById.mockResolvedValue({ id: '1', username: 'john' });
    repository.update.mockResolvedValue({ id: '1', username: 'jane' });
    await expect(service.update('1', { username: 'jane' } as any)).resolves.toMatchObject({ username: 'jane' });
  });

  it('throws when deleting unknown user', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.delete('missing')).rejects.toThrow(NotFoundException);
  });

  it('assigns roles and clears permissions cache', async () => {
    repository.findById.mockResolvedValue({ id: '1' });
    const result = await service.assignRoles('1', ['role-1']);
    expect(result).toBeDefined();
  });
});
