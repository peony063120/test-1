import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from './test-setup';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/login should return tokens for valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(201);
    expect(res.body).toHaveProperty('accessToken');
  });
});
