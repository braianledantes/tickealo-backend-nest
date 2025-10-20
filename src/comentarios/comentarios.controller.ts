import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'No autorizado' })
@ApiResponse({ status: 403, description: 'Acceso denegado' })
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @ApiResponse({ status: 201, description: 'Comentario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos del comentario inválidos' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Roles(Role.Cliente)
  @Post('evento/:eventoId')
  create(
    @GetUser('id') userId: number,
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() createComentarioDto: CreateComentarioDto,
  ) {
    return this.comentariosService.create(
      userId,
      eventoId,
      createComentarioDto,
    );
  }

  @ApiResponse({ status: 200, description: 'Lista de comentarios del evento' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Get('evento/:eventoId')
  findAll(@Param('eventoId', ParseIntPipe) eventoId: number) {
    return this.comentariosService.findAll(eventoId);
  }

  @ApiResponse({ status: 200, description: 'Comentario encontrado' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comentariosService.findOne(id);
  }

  @ApiResponse({
    status: 200,
    description: 'Comentario actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  @Roles(Role.Cliente)
  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComentarioDto: UpdateComentarioDto,
  ) {
    return this.comentariosService.update(userId, id, updateComentarioDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Comentario eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  @Roles(Role.Cliente, Role.Productora)
  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.comentariosService.remove(userId, id);
  }

  @Roles(Role.Productora)
  @Patch(':id/fijar')
  fijarComentario(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comentariosService.fijarComentario(userId, id);
  }

  @Roles(Role.Productora)
  @Patch(':id/desfijar')
  desfijarComentario(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comentariosService.desfijarComentario(userId, id);
  }
}
