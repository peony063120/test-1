import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('report-generation')
export class ReportWorker {
  @Process()
  async handle(job: Job) {
    return { jobId: job.id, status: 'report generated' };
  }
}
