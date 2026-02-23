import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('actividades')
@UseGuards(JwtAuthGuard)
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Post()
  create(@Body() createActividadDto: CreateActividadDto, @Request() req) {
    return this.actividadesService.create(createActividadDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.actividadesService.findAll(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActividadDto: UpdateActividadDto, @Request() req) {
    return this.actividadesService.update(id, updateActividadDto, req.user.userId);
  }

  @Patch(':id/completar')
  marcarCompletada(@Param('id') id: string) {
    return this.actividadesService.marcarCompletada(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(id);
  }
}
