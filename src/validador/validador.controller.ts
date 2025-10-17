import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { ValidadorService } from './validador.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Roles(Role.Validador)
@Controller('validador')
export class ValidadorController {
  constructor(private readonly validadorService: ValidadorService) {}

  @ApiOperation({
    summary:
      'Obtener eventos de las productoras asociadas al validador autenticado',
    description: '🛡️ **Acceso:** Solo Validadores autenticados',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de eventos de las productoras asociadas al validador obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo validadores',
  })
  @Get('eventos')
  getEventosDelValidador(@GetUser('id') userId: number) {
    return this.validadorService.getEventosDelValidador(userId);
  }

  @Roles(Role.Validador)
  @Get('eventos/:eventoId/tickets')
  getTicketsByEvento(
    @GetUser('id') userId: number,
    @Param('eventoId', ParseIntPipe) eventoId: number,
  ) {
    return this.validadorService.getTicketsByEvento(userId, eventoId);
  }

  @ApiOperation({
    summary: 'Obtener productoras asociadas al validador autenticado',
    description: '🛡️ **Acceso:** Solo Validadores autenticados',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de productoras asociadas al validador obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo validadores',
  })
  @Get('productoras')
  getProductorasDelValidador(@GetUser('id') userId: number) {
    return this.validadorService.getProductorasDelValidador(userId);
  }
}
