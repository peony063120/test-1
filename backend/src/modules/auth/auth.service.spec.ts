import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PermissionService } from '../permission/permission.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let redisService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn(() => 'signed-token'), verify: jest.fn(() => ({ sub: 'user-1' })) };
    redisService = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: {} },
        { provide: PermissionService, useValue: {} },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn((key: string) => ({ JWT_SECRET: 'secret' }[key] || undefined)) } },
        { provide: RedisService, useValue: redisService },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('logs in a user and returns tokens', async () => {
    const passwordHash = await bcrypt.hash('admin123', 10);
    prismaService.user.findUnique
      .mockResolvedValueOnce({ id: 'user-1', username: 'admin', email: 'admin@example.com', roles: [], passwordHash })
      .mockResolvedValueOnce({ id: 'user-1', roles: [] });
    const result = await service.login({ username: 'admin', password: 'admin123' } as any);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(redisService.set).toHaveBeenCalled();
  });

  it('throws on invalid credentials', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);
    await expect(service.validateUser('admin', 'bad')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshes token for a valid user', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce({ id: 'user-1', username: 'admin', email: 'admin@example.com', roles: [] })
      .mockResolvedValueOnce({ id: 'user-1', roles: [] });
    const result = await service.refreshToken('refresh-token');
    expect(result.accessToken).toBeDefined();
  });

  it('changes password successfully', async () => {
    const oldPasswordHash = await bcrypt.hash('old', 10);
    prismaService.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash: oldPasswordHash });
    prismaService.user.update.mockResolvedValue({ id: 'user-1' });
    const result = await service.changePassword('user-1', 'old', 'new');
    expect(result.success).toBe(true);
    expect(prismaService.user.update).toHaveBeenCalled();
  });

  it('forgot password returns success even for unknown email', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);
    await expect(service.forgotPassword('missing@example.com')).resolves.toEqual({ success: true });
  });
});
