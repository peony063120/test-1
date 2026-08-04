import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from './test-setup';

describe('ProductController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/products should reject invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/products')
      .send({})
      .expect(400);
  });
});
