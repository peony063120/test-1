import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, INotificationRepository } from './repositories/notification.repository.interface';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class NotificationService {
  constructor(@Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepository: INotificationRepository) {}

  async create(userId: string, title: string, content: string) {
    return this.notificationRepository.save({ userId, title, content, status: 'UNREAD' });
  }

  async sendToUser(userId: string, title: string, content: string) {
    return this.create(userId, title, content);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new NotFoundException('Notification not found for user');
    return this.notificationRepository.update(notificationId, { status: 'READ' });
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async findByUser(userId: string, query: NotificationQueryDto) {
    return this.notificationRepository.findByUser(userId, query);
  }

  async countUnread(userId: string) {
    return this.notificationRepository.countUnread(userId);
  }
}
