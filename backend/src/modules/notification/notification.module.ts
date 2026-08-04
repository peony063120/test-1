import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NOTIFICATION_REPOSITORY } from './repositories/notification.repository.interface';
import { NotificationRepositoryImpl } from './repositories/notification.repository.impl';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationRepositoryImpl },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
