export class NotificationEntity {
  id: string = '';
  title: string = '';
  content: string = '';
  status: string = '';
  userId: string = '';
  createdAt: Date = new Date();
  updatedAt?: Date;
}
