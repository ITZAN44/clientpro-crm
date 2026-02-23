import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('general')
  async getGeneralStats(@Request() req) {
    return this.statsService.getGeneralStats(req.user.userId);
  }

  @Get('distribucion-etapas')
  async getDistribucionPorEtapa() {
    return this.statsService.getDistribucionPorEtapa();
  }
}
