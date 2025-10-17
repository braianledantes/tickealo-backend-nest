import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { MultipleImageFileValidationPipe } from 'src/files/pipes/multiple-image-file-validation.pipe';
import { CreateEventoDto } from './dto/create-evento.dto';
import { FindEventosDto } from './dto/find-eventos.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { EventosClienteService } from './services/eventos-cliente.service';
import { EventosProductoraService } from './services/eventos-productora.service';

@ApiTags('Eventos')
@ApiBearerAuth()
@Controller('eventos')
export class EventosController {
  constructor(
    private readonly eventosClienteService: EventosClienteService,
    private readonly eventosProductoraService: EventosProductoraService,
  ) {}

  @ApiOperation({
    summary: 'Crear un nuevo evento',
    description: '🏢 **Acceso:** Solo Productoras autenticadas',
  })
  @ApiBody({ type: CreateEventoDto })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos del evento inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @Roles(Role.Productora)
  @Post()
  create(
    @GetUser('id') userId: number,
    @Body() createEventoDto: CreateEventoDto,
  ) {
    return this.eventosProductoraService.create(userId, createEventoDto);
  }

  @ApiOperation({
    summary: 'Obtener eventos próximos',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos próximos obtenida exitosamente',
  })
  @Roles(Role.Cliente)
  @Get('proximos')
  findUpcoming() {
    return this.eventosClienteService.findUpcoming();
  }

  @Roles(Role.Cliente)
  @Get('seguidos')
  findFollowedEventos(@GetUser('id') userId: number) {
    return this.eventosClienteService.findFollowedEventos(userId);
  }

  @ApiOperation({
    summary: 'Actualizar imágenes de un evento',
    description:
      '🏢 **Acceso:** Solo Productoras autenticadas (propietarias del evento)',
  })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        portada: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de portada del evento',
        },
        banner: {
          type: 'string',
          format: 'binary',
          description: 'Banner del evento',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Imágenes actualizadas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Roles(Role.Productora)
  @Patch(':id/imagenes')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'portada', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  updateImagenes(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles(new MultipleImageFileValidationPipe())
    files: { portada?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    return this.eventosProductoraService.updateImagenes(userId, id, files);
  }

  @ApiOperation({
    summary: 'Obtener todos los eventos con paginación',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiQuery({ type: FindEventosDto })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de eventos obtenida exitosamente',
  })
  @Roles(Role.Cliente)
  @Get()
  findAll(@Query() findEventosDto: FindEventosDto) {
    return this.eventosClienteService.findAllPaginated(findEventosDto);
  }

  @ApiOperation({
    summary: 'Obtener un evento por ID',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Evento obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Get(':id')
  findOne(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.eventosClienteService.findOne(userId, id);
  }

  @Roles(Role.Productora)
  @Get(':id/tickets')
  findTicketsByEvento(@Param('id', ParseIntPipe) id: number) {
    return this.eventosProductoraService.findTicketsByEvento(id);
  }

  @ApiOperation({
    summary: 'Actualizar un evento',
    description:
      '🏢 **Acceso:** Solo Productoras autenticadas (propietarias del evento)',
  })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiBody({ type: UpdateEventoDto })
  @ApiResponse({ status: 200, description: 'Evento actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos del evento inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Roles(Role.Productora)
  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventoDto: UpdateEventoDto,
  ) {
    return this.eventosProductoraService.update(userId, id, updateEventoDto);
  }

  @ApiOperation({
    summary: 'Eliminar un evento',
    description:
      '🏢👤 **Acceso:** Solo Productoras (propietarias) y Administradores',
  })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiResponse({ status: 204, description: 'Evento eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras y administradores',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Roles(Role.Productora, Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.eventosProductoraService.remove(userId, id);
  }
}
