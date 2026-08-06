import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import { RoleModule } from '../role/role.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, LoggerModule, RoleModule, AuthModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    AuditLogService,
    RedisService,
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
