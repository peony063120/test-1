import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NOTIFICATION_REPOSITORY } from './repositories/notification.repository.interface';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: { save: jest.Mock; update: jest.Mock; findById: jest.Mock; findByUser: jest.Mock; markAllAsRead: jest.Mock; countUnread: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      markAllAsRead: jest.fn(),
      countUnread: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService, { provide: NOTIFICATION_REPOSITORY, useValue: repository }],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('creates a notification', async () => {
    repository.save.mockResolvedValue({ id: 'n1' });
    await expect(service.create('u1', 'Hello', 'World')).resolves.toEqual({ id: 'n1' });
    expect(repository.save).toHaveBeenCalledWith({ userId: 'u1', title: 'Hello', content: 'World', status: 'UNREAD' });
  });

  it('marks a notification as read', async () => {
    repository.findById.mockResolvedValue({ id: 'n1', userId: 'u1' });
    repository.update.mockResolvedValue({ id: 'n1', status: 'READ' });
    await expect(service.markAsRead('n1', 'u1')).resolves.toEqual({ id: 'n1', status: 'READ' });
  });

  it('counts unread notifications', async () => {
    repository.countUnread.mockResolvedValue(3);
    await expect(service.countUnread('u1')).resolves.toBe(3);
  });
});
