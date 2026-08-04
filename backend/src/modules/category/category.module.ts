import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CATEGORY_REPOSITORY } from './repositories/category.repository.interface';
import { CategoryRepositoryImpl } from './repositories/category.repository.impl';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    { provide: CATEGORY_REPOSITORY, useClass: CategoryRepositoryImpl },
    AuditLogService,
    RedisService,
  ],
  exports: [CategoryService, CATEGORY_REPOSITORY],
})
export class CategoryModule {}
