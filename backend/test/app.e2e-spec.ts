import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from './test-setup';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1 (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1').expect(404);
    expect(res.status).toBe(404);
  });
});
