import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { StockTransactionController } from './stock-transaction.controller';
import { StockTransactionService } from './stock-transaction.service';
import { STOCK_TRANSACTION_REPOSITORY } from './repositories/stock-transaction.repository.interface';
import { StockTransactionRepositoryImpl } from './repositories/stock-transaction.repository.impl';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, LoggerModule, UserModule, AuthModule],
  controllers: [StockTransactionController],
  providers: [
    StockTransactionService,
    { provide: STOCK_TRANSACTION_REPOSITORY, useClass: StockTransactionRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [StockTransactionService],
})
export class StockTransactionModule {}
