import { Controller, Delete, Param, ParseIntPipe, Post } from '@nestjs/common';
import { RecordatoriosService } from './recordatorios.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'No autorizado' })
@ApiResponse({ status: 403, description: 'Acceso denegado' })
@Controller('recordatorios')
export class RecordatoriosController {
  constructor(private readonly recordatoriosService: RecordatoriosService) {}

  @ApiOperation({
    summary: 'Crear recordatorio para un evento a un cliente',
    description: '👤 **Acceso:** Solo Clientes autenticados',
  })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiResponse({
    status: 201,
    description: 'Recordatorio creado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Evento o Cliente no encontrado' })
  @Roles(Role.Cliente)
  @Post('eventos/:id')
  createRecordatorio(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventoId: number,
  ) {
    return this.recordatoriosService.createRecordatorios(userId, eventoId);
  }

  @ApiOperation({
    summary: 'Eliminar recordatorio para un evento a un cliente',
    description: '👤 **Acceso:** Solo Clientes autenticados',
  })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiResponse({
    status: 204,
    description: 'Recordatorio eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Recordatorio no encontrado' })
  @Roles(Role.Cliente)
  @Delete('eventos/:id')
  deleteRecordatorio(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventoId: number,
  ) {
    return this.recordatoriosService.removeRecordatorios(userId, eventoId);
  }
}
