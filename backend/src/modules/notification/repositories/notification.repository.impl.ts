import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { INotificationRepository } from './notification.repository.interface';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: any) {
    const notification = await this.prisma.notification.create({
      data: {
        title: data.title,
        content: data.content,
        status: data.status ?? 'UNREAD',
        type: data.type ?? 'INFO',
        priority: data.priority ?? 'NORMAL',
      },
    });

    await this.prisma.notificationRecipient.create({
      data: {
        notificationId: notification.id,
        userId: data.userId,
      },
    });

    return notification;
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.notification.update({ where: { id }, data });
  }

  async findById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async findByUser(userId: string, query: any = {}) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: any = { recipients: { some: { userId } } };
    if (query.status) where.status = query.status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findAll(query: any = {}) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count(),
    ]);
    return { items, total, page, limit };
  }

  async markAllAsRead(userId: string) {
    const recipients = await this.prisma.notificationRecipient.findMany({ where: { userId } });
    await Promise.all(recipients.map((recipient) => this.prisma.notification.update({ where: { id: recipient.notificationId }, data: { status: 'READ' } })));
  }

  async countUnread(userId: string) {
    return this.prisma.notification.count({ where: { recipients: { some: { userId } }, status: 'UNREAD' } });
  }

  async delete(id: string) {
    await this.prisma.notification.delete({ where: { id } });
  }
}
