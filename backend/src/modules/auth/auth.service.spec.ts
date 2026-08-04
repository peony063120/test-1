import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PermissionService } from '../permission/permission.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: { findByUsername: jest.Mock; findById: jest.Mock; update: jest.Mock };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let redisService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    userService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    jwtService = { sign: jest.fn(() => 'signed-token'), verify: jest.fn(() => ({ sub: 'user-1' })) };
    redisService = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: PermissionService, useValue: {} },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn((key: string) => ({ JWT_SECRET: 'secret' }[key] || undefined)) } },
        { provide: RedisService, useValue: redisService },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('logs in a user and returns tokens', async () => {
    userService.findByUsername.mockResolvedValue({ id: 'user-1', username: 'admin', email: 'admin@example.com', roles: [{ name: 'admin' }], passwordHash: '$2b$10$abc' });
    const result = await service.login({ username: 'admin', password: 'admin123' } as any);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(redisService.set).toHaveBeenCalled();
  });

  it('throws on invalid credentials', async () => {
    userService.findByUsername.mockResolvedValue(null);
    await expect(service.validateUser('admin', 'bad')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshes token for a valid user', async () => {
    userService.findById.mockResolvedValue({ id: 'user-1', username: 'admin', email: 'admin@example.com', roles: [] });
    const result = await service.refreshToken('refresh-token');
    expect(result.accessToken).toBeDefined();
  });

  it('changes password successfully', async () => {
    userService.findById.mockResolvedValue({ id: 'user-1', passwordHash: '$2b$10$abc' });
    const result = await service.changePassword('user-1', 'old', 'new');
    expect(result.success).toBe(true);
    expect(userService.update).toHaveBeenCalled();
  });

  it('forgot password returns success even for unknown email', async () => {
    userService.findByUsername.mockResolvedValue(null);
    await expect(service.forgotPassword('missing@example.com')).resolves.toEqual({ success: true });
  });
});
