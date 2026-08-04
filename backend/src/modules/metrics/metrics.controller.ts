import { Controller, Get, Req } from '@nestjs/common';
import { MetricsInterceptor } from './metrics.interceptor';

@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics(@Req() req: any) {
    return `# HELP http_requests_total Total HTTP requests\n# TYPE http_requests_total counter\n${MetricsInterceptor.snapshot()}\n`;
  }
}
