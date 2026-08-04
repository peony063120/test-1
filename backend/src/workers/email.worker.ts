import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class EmailWorker {
  @Process()
  async handle(job: Job) {
    return { jobId: job.id, status: 'email sent' };
  }
}
