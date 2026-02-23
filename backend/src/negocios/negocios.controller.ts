import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NegociosService } from './negocios.service';
import { CreateNegocioDto } from './dto/create-negocio.dto';
import { UpdateNegocioDto } from './dto/update-negocio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EtapaNegocio } from '@prisma/client';

@Controller('negocios')
@UseGuards(JwtAuthGuard)
export class NegociosController {
  constructor(private readonly negociosService: NegociosService) {}

  @Post()
  create(@Body() createNegocioDto: CreateNegocioDto, @Request() req) {
    return this.negociosService.create(createNegocioDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('etapa') etapa?: EtapaNegocio,
    @Query('propietarioId') propietarioId?: string,
  ) {
    return this.negociosService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      etapa,
      propietarioId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.negociosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNegocioDto: UpdateNegocioDto,
    @Request() req,
  ) {
    return this.negociosService.update(id, updateNegocioDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.negociosService.remove(id);
  }

  @Patch(':id/etapa')
  cambiarEtapa(
    @Param('id') id: string,
    @Body('etapa') etapa: EtapaNegocio,
    @Request() req,
  ) {
    return this.negociosService.cambiarEtapa(id, etapa, req.user.userId);
  }
}
