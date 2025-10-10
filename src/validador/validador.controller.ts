import { Controller, Get } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { ValidadorService } from './validador.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
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
  @Roles(Role.Validador)
  @Get('eventos')
  getEventosDelValidador(@GetUser('id') userId: number) {
    return this.validadorService.getEventosDelValidador(userId);
  }
}
