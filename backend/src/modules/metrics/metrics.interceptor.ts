import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private static readonly requests = new Map<string, number>();
  private static readonly durations = new Map<string, number[]>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method || 'UNKNOWN';
    const route = req.route?.path || req.path || 'unknown';
    const key = `${method} ${route}`;

    MetricsInterceptor.incrementRequest(key);
    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        MetricsInterceptor.recordDuration(key, Number(process.hrtime.bigint() - startedAt) / 1e9);
      }),
      catchError((error) => {
        MetricsInterceptor.recordDuration(key, Number(process.hrtime.bigint() - startedAt) / 1e9);
        return throwError(() => error);
      }),
    );
  }

  static snapshot(): string {
    const lines: string[] = [];
    for (const [key, value] of MetricsInterceptor.requests.entries()) {
      const [method, route] = key.split(' ');
      lines.push(`http_requests_total{method="${method}",route="${route}"} ${value}`);
      const durations = MetricsInterceptor.durations.get(key) || [];
      const total = durations.reduce((sum, item) => sum + item, 0);
      lines.push(`http_request_duration_seconds_sum{method="${method}",route="${route}"} ${total.toFixed(6)}`);
      lines.push(`http_request_duration_seconds_count{method="${method}",route="${route}"} ${durations.length}`);
    }
    return lines.join('\n');
  }

  private static incrementRequest(key: string) {
    const current = MetricsInterceptor.requests.get(key) || 0;
    MetricsInterceptor.requests.set(key, current + 1);
  }

  private static recordDuration(key: string, durationSeconds: number) {
    const durations = MetricsInterceptor.durations.get(key) || [];
    durations.push(durationSeconds);
    MetricsInterceptor.durations.set(key, durations);
  }
}
