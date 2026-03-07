import { Controller, Get } from '@nestjs/common';
import { getMetrics } from '../common/interceptors/metrics.interceptor';

@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics() {
    return getMetrics();
  }
}
