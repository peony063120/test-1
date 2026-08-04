import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { SalesDetailService } from './sales-detail.service';
import { SALES_DETAIL_REPOSITORY } from './repositories/sales-detail.repository.interface';
import { SalesDetailRepositoryImpl } from './repositories/sales-detail.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [
    SalesDetailService,
    { provide: SALES_DETAIL_REPOSITORY, useClass: SalesDetailRepositoryImpl },
  ],
  exports: [SalesDetailService],
})
export class SalesDetailModule {}
