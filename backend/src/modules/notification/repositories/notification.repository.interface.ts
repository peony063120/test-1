export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export interface INotificationRepository {
  save(data: any): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByUser(userId: string, query?: any): Promise<any>;
  findAll(query?: any): Promise<any>;
  markAllAsRead(userId: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
  delete(id: string): Promise<void>;
}
