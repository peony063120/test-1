import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('image-processing')
export class ImageProcessorWorker {
  @Process()
  async handle(job: Job) {
    return { jobId: job.id, status: 'processed' };
  }
}
