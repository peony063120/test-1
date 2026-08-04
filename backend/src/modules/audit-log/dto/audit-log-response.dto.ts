export class AuditLogResponseDto {
  id: string = '';
  userId?: string;
  action: string = '';
  entity: string = '';
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ip?: string;
  createdAt: Date = new Date();
}
