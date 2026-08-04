import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportService],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('returns inventory report', async () => {
    await expect(service.getInventoryReport({} as any)).resolves.toEqual({ type: 'inventory', query: {}, data: [] });
  });
});
