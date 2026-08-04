import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async () => {
        const req = context.switchToHttp().getRequest();
        const method = req.method.toUpperCase();
        const route = req.route?.path || req.path || 'unknown';
        const action = this.mapMethodToAction(method);
        const userId = req.user?.id;
        if (action && route) {
          await this.auditLogService.log(userId, action, route, req.params?.id, null, { method, path: route }, req.ip);
        }
      }),
    );
  }

  private mapMethodToAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'READ';
    }
  }
}
