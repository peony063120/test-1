import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SearchService } from '../modules/search/search.service';

@Processor('es-sync')
export class EsSyncWorker {
  constructor(private readonly searchService: SearchService) {}

  @Process()
  async handle(job: Job) {
    if (job.data.action === 'delete') {
      return this.searchService.removeProduct(job.data.productId);
    }
    return this.searchService.indexProduct({ id: job.data.productId, ...job.data });
  }
}
