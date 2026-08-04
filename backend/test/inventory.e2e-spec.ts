import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from './test-setup';

describe('InventoryController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/inventories should return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/inventories').expect(401);
  });
});
