import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { PurchaseDetailService } from './purchase-detail.service';
import { PURCHASE_DETAIL_REPOSITORY } from './repositories/purchase-detail.repository.interface';
import { PurchaseDetailRepositoryImpl } from './repositories/purchase-detail.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [
    PurchaseDetailService,
    { provide: PURCHASE_DETAIL_REPOSITORY, useClass: PurchaseDetailRepositoryImpl },
  ],
  exports: [PurchaseDetailService],
})
export class PurchaseDetailModule {}
