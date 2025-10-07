import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateLugarDto } from './dto/create-lugar.dto';
import { UpdateLugarDto } from './dto/update-lugar.dto';
import { LugaresService } from './lugares.service';

@ApiTags('Lugares')
@ApiBearerAuth()
@Controller('lugares')
export class LugaresController {
  constructor(private readonly lugaresService: LugaresService) {}

  @ApiOperation({ summary: 'Crear un nuevo lugar' })
  @ApiBody({ type: CreateLugarDto })
  @ApiResponse({ status: 201, description: 'Lugar creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos del lugar inválidos' })
  @Post()
  create(@Body() createLugareDto: CreateLugarDto) {
    return this.lugaresService.create(createLugareDto);
  }

  @ApiOperation({ summary: 'Obtener todos los lugares' })
  @ApiResponse({
    status: 200,
    description: 'Lista de lugares obtenida exitosamente',
  })
  @Get()
  findAll() {
    return this.lugaresService.findAll();
  }

  @ApiOperation({ summary: 'Buscar lugares cercanos a una ubicación' })
  @ApiParam({
    name: 'latitud',
    description: 'Latitud de la ubicación de referencia',
  })
  @ApiParam({
    name: 'longitud',
    description: 'Longitud de la ubicación de referencia',
  })
  @ApiQuery({
    name: 'radius',
    description: 'Radio de búsqueda en kilómetros',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lugares cercanos encontrados exitosamente',
  })
  @Get(':latitud/:longitud')
  findClosePlaces(
    @Param('latitud', ParseFloatPipe) latitud: number,
    @Param('longitud', ParseFloatPipe) longitud: number,
    @Query('radius', new DefaultValuePipe(5), ParseFloatPipe) radius: number,
  ) {
    return this.lugaresService.findClosePlaces(latitud, longitud, radius);
  }

  @ApiOperation({ summary: 'Obtener un lugar por ID' })
  @ApiParam({ name: 'id', description: 'ID del lugar' })
  @ApiResponse({ status: 200, description: 'Lugar obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Lugar no encontrado' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lugaresService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar un lugar' })
  @ApiParam({ name: 'id', description: 'ID del lugar' })
  @ApiBody({ type: UpdateLugarDto })
  @ApiResponse({ status: 200, description: 'Lugar actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos del lugar inválidos' })
  @ApiResponse({ status: 404, description: 'Lugar no encontrado' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLugareDto: UpdateLugarDto,
  ) {
    return this.lugaresService.update(id, updateLugareDto);
  }

  @ApiOperation({ summary: 'Eliminar un lugar' })
  @ApiParam({ name: 'id', description: 'ID del lugar' })
  @ApiResponse({ status: 204, description: 'Lugar eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Lugar no encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lugaresService.remove(id);
  }
}
