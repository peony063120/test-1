import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { createValidationPipe } from '../../common/pipes/validation.pipe';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn().mockResolvedValue({ accessToken: 'new-access-token' }),
    logout: jest.fn().mockResolvedValue({ success: true }),
    changePassword: jest.fn(),
    forgotPassword: jest.fn().mockResolvedValue({ success: true }),
    resetPassword: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      controllers: [AuthController],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.setGlobalPrefix('api/v1');
    await app.init();

    jwtService = app.get(JwtService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/refresh returns a new access token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'valid-refresh-token' })
      .expect(201);

    expect(res.body).toEqual({ accessToken: 'new-access-token' });
    expect(authService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
  });

  it('POST /api/v1/auth/refresh returns 400 when refresh token is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({})
      .expect(400);

    expect(res.body.message).toBe('Validation failed');
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });

  it('POST /api/v1/auth/logout returns 401 when bearer token is missing', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({})
      .expect(401);

    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('POST /api/v1/auth/logout logs out authenticated user', async () => {
    const accessToken = jwtService.sign({ sub: 'user-1', username: 'admin' });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    expect(res.body).toEqual({ success: true });
    expect(authService.logout).toHaveBeenCalledWith('user-1');
  });

  it('POST /api/v1/auth/reset-password calls service with valid payload', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ token: 'reset-token', newPassword: 'newPassword123' })
      .expect(201);

    expect(res.body).toEqual({ success: true });
    expect(authService.resetPassword).toHaveBeenCalledWith('reset-token', 'newPassword123');
  });

  it('POST /api/v1/auth/reset-password returns 400 for weak password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ token: 'reset-token', newPassword: '123' })
      .expect(400);

    expect(res.body.message).toBe('Validation failed');
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });
});
