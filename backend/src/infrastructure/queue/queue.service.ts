import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('image-processing') private readonly imageQueue: Queue,
    @InjectQueue('es-sync') private readonly esQueue: Queue,
    @InjectQueue('report-generation') private readonly reportQueue: Queue,
  ) {}

  async addEmailJob(to: string, subject: string, content: string) {
    return this.emailQueue.add({ to, subject, content });
  }

  async addImageJob(fileId: string, operations: any) {
    return this.imageQueue.add({ fileId, operations });
  }

  async addEsSyncJob(productId: string, action: string) {
    return this.esQueue.add({ productId, action });
  }

  async addReportJob(reportType: string, params: any) {
    return this.reportQueue.add({ reportType, params });
  }
}
