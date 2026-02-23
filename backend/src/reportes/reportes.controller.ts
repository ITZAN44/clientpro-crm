import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReporteQueryDto } from './dto/reporte-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('conversion')
  async getConversion(@Query() query: ReporteQueryDto) {
    return this.reportesService.getConversion(query);
  }

  @Get('comparativas')
  async getComparativas() {
    return this.reportesService.getComparativas();
  }

  @Get('rendimiento-usuarios')
  async getRendimientoUsuarios(@Query() query: ReporteQueryDto) {
    return this.reportesService.getRendimientoUsuarios(query);
  }
}
