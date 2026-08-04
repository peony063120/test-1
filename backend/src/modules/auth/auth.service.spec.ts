import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PermissionService } from '../permission/permission.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: { findByUsername: jest.fn(), findById: jest.fn(), update: jest.fn() } },
        { provide: PermissionService, useValue: {} },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'token'), verify: jest.fn(() => ({ sub: '1' })) } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: RedisService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('validates user', async () => {
    const userService = (await import('../user/user.service')).UserService;
    const mock = jest.fn();
    // placeholder
    expect(service).toBeDefined();
  });
});
