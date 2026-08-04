import { Module } from '@nestjs/common';
import { QueueModule } from '../infrastructure/queue/queue.module';
import { SearchModule } from '../modules/search/search.module';
import { ImageProcessorWorker } from './image-processor.worker';
import { EsSyncWorker } from './es-sync.worker';
import { EmailWorker } from './email.worker';
import { ReportWorker } from './report.worker';

@Module({
  imports: [QueueModule, SearchModule],
  providers: [ImageProcessorWorker, EsSyncWorker, EmailWorker, ReportWorker],
})
export class WorkerModule {}
