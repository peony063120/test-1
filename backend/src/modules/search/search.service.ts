import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexProduct(product: any) {
    await this.elasticsearchService.index({
      index: 'products',
      id: product.id,
      document: {
        id: product.id,
        title: product.name,
        sku: product.sku,
        barcode: product.barcode,
        description: product.description,
        category: product.category?.name || '',
        brand: product.brand?.name || '',
        price: Number(product.salePrice || 0),
        status: product.status,
        createdAt: product.createdAt,
      },
    });
    return { success: true };
  }

  async removeProduct(productId: string) {
    await this.elasticsearchService.delete({ index: 'products', id: productId });
    return { success: true };
  }

  async search(query: string, filters: SearchQueryDto = {}) {
    const q = (query || '').trim();
    if (!q) return { items: [], total: 0 };

    const result = await this.elasticsearchService.search({
      index: 'products',
      query: {
        multi_match: {
          query: q,
          fields: ['title^3', 'sku^2', 'barcode', 'description'],
          fuzziness: 'AUTO',
        },
      },
      size: filters.limit || 20,
      from: ((filters.page || 1) - 1) * (filters.limit || 20),
    });

    return {
      items: result.hits.hits.map((hit: any) => hit._source),
      total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0,
    };
  }

  async autoComplete(query: string) {
    const q = (query || '').trim();
    if (!q) return [];
    const result = await this.elasticsearchService.search({
      index: 'products',
      query: {
        match_phrase_prefix: { title: q },
      },
      size: 10,
    });
    return result.hits.hits.map((hit: any) => hit._source.title);
  }
}
