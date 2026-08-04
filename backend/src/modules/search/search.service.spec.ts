import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';

describe('SearchService', () => {
  let service: SearchService;
  let elasticsearch: { search: jest.Mock; index: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    elasticsearch = { search: jest.fn(), index: jest.fn(), delete: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchService, { provide: ElasticsearchService, useValue: elasticsearch }],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('searches products', async () => {
    elasticsearch.search.mockResolvedValue({ hits: { hits: [{ _source: { id: 'p1' } }], total: { value: 1 } } });
    await expect(service.search('shoe')).resolves.toEqual({ items: [{ id: 'p1' }], total: 1 });
  });
});
