import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CuentaBancariaService } from './cuenta-bancaria.service';
import { CreateCuentaBancariaDto } from './dto/create-cuenta-bancaria.dto';
import { UpdateCuentaBancariaDto } from './dto/update-cuenta-bancaria.dto';

@ApiTags('Cuenta Bancaria')
@ApiBearerAuth()
@Roles(Role.Productora)
@Controller('cuenta-bancaria')
export class CuentaBancariaController {
  constructor(private readonly mediospagoService: CuentaBancariaService) {}

  @ApiOperation({ summary: 'Crear cuenta bancaria para la productora' })
  @ApiBody({ type: CreateCuentaBancariaDto })
  @ApiResponse({
    status: 201,
    description: 'Cuenta bancaria creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de cuenta bancaria inválidos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({
    status: 409,
    description: 'La productora ya tiene una cuenta bancaria',
  })
  @Post()
  create(
    @GetUser('id') userId: number,
    @Body() createMediospagoDto: CreateCuentaBancariaDto,
  ) {
    return this.mediospagoService.create(userId, createMediospagoDto);
  }

  @ApiOperation({
    summary: 'Obtener cuenta bancaria de la productora autenticada',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuenta bancaria obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({ status: 404, description: 'Cuenta bancaria no encontrada' })
  @Get()
  findByProductora(@GetUser('id') userId: number) {
    return this.mediospagoService.findByProductora(userId);
  }

  @ApiOperation({ summary: 'Actualizar cuenta bancaria de la productora' })
  @ApiBody({ type: UpdateCuentaBancariaDto })
  @ApiResponse({
    status: 200,
    description: 'Cuenta bancaria actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de cuenta bancaria inválidos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({ status: 404, description: 'Cuenta bancaria no encontrada' })
  @Patch()
  update(
    @GetUser('id') userId: number,
    @Body() updateMediospagoDto: UpdateCuentaBancariaDto,
  ) {
    return this.mediospagoService.update(userId, updateMediospagoDto);
  }

  @ApiOperation({ summary: 'Eliminar cuenta bancaria de la productora' })
  @ApiResponse({
    status: 204,
    description: 'Cuenta bancaria eliminada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({ status: 404, description: 'Cuenta bancaria no encontrada' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  remove(@GetUser('id') userId: number) {
    return this.mediospagoService.remove(userId);
  }
}
