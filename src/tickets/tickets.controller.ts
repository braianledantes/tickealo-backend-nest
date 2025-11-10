import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { TicketsService } from './tickets.service';

@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Roles(Role.Cliente)
  @Get()
  getMisTickets(@GetUser('id') userId: number) {
    return this.ticketsService.getTicketsByCliente(userId);
  }

  @ApiOperation({
    summary: 'Validar un ticket mediante su código alfanumérico',
  })
  @ApiParam({
    name: 'codigoAlfanumerico',
    type: String,
    description: 'Código alfanumérico del ticket a validar',
    example: '0AC 2N1',
  })
  @ApiResponse({ status: 200, description: 'Ticket validado correctamente' })
  @ApiResponse({ status: 400, description: 'El ticket ya fue utilizado' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  @Roles(Role.Validador, Role.Productora)
  @Patch(':codigoAlfanumerico/validar')
  validarTicket(
    @GetUser('id') userId: number,
    @Param('codigoAlfanumerico') codigoAlfanumerico: string,
  ) {
    return this.ticketsService.validarTicket(userId, codigoAlfanumerico);
  }

  @ApiOperation({
    summary: 'Obtener tickets asociados a un evento',
    description:
      '🏢 **Acceso:** Solo Productoras autenticadas (propietarias del evento)',
  })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Tickets obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Roles(Role.Productora, Role.Validador)
  @Get('eventos/:idEvento')
  findTicketsByEvento(@Param('idEvento', ParseIntPipe) idEvento: number) {
    return this.ticketsService.findTicketsByEvento(idEvento);
  }

  @Roles(Role.Cliente)
  @Post(':ticketId/transferir/:receptorEmail')
  transferirTicket(
    @GetUser('id') userId: number,
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Param('receptorEmail') receptorEmail: string,
  ) {
    return this.ticketsService.transferirTicket(
      userId,
      ticketId,
      receptorEmail,
    );
  }

  @Roles(Role.Cliente)
  @Get('transferencias/recibidas')
  getMisTransferencias(@GetUser('id') userId: number) {
    return this.ticketsService.findTransferenciasRecibidas(userId);
  }

  @Roles(Role.Cliente)
  @Post('transferencias/:transferenciaId/aceptar')
  aceptarTransferencia(
    @GetUser('id') userId: number,
    @Param('transferenciaId', ParseIntPipe) transferenciaId: number,
  ) {
    return this.ticketsService.aceptarTransferencia(userId, transferenciaId);
  }

  @Roles(Role.Cliente)
  @Post('transferencias/:transferenciaId/rechazar')
  rechazarTransferencia(
    @GetUser('id') userId: number,
    @Param('transferenciaId', ParseIntPipe) transferenciaId: number,
  ) {
    return this.ticketsService.rechazarTransferencia(userId, transferenciaId);
  }
}
