import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { EstadoTicket } from './enums/estado-ticket.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    private readonly clientesService: ClientesService,
  ) {}

  /**
   * Actualiza el estado de todos los tickets asociados a una compra específica.
   * @param idCompra ID de la compra cuyos tickets se van a actualizar.
   * @param estado Nuevo estado que se asignará a los tickets.
   * @throws NotFoundException si no se encuentra la compra o los tickets asociados.
   */
  async updateEstadoTicketsDeCompra(idCompra: number, estado: EstadoTicket) {
    await this.ticketsRepository.update(
      { compra: { id: idCompra } },
      { estado: estado },
    );
  }

  /**
   * Valida un ticket específico mediante su código alfanumérico.
   * @param userId ID del usuario que intenta validar el ticket.
   * @param codigoAlfanumerico Código alfanumérico del ticket a validar.
   * @throws UnauthorizedException si el usuario no tiene permiso para validar el ticket.
   * @throws NotFoundException si el ticket no existe.
   * @throws BadRequestException si el ticket ya fue utilizado o no está en estado pendiente de validación.
   */
  async validarTicket(userId: number, codigoAlfanumerico: string) {
    const user = await this.clientesService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const ticket = await this.ticketsRepository.findOne({
      where: { codigoAlfanumerico: codigoAlfanumerico },
      relations: [
        'entrada',
        'entrada.evento',
        'entrada.evento.productora',
        'entrada.evento.productora.validadores',
      ],
    });
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (!ticket.entrada) {
      throw new BadRequestException('El ticket no tiene una entrada asociada');
    }

    if (!ticket.entrada.evento) {
      throw new BadRequestException(
        'La entrada del ticket no tiene un evento asociado',
      );
    }

    if (!ticket.entrada.evento.productora) {
      throw new BadRequestException(
        'El evento de la entrada no tiene una productora asociada',
      );
    }

    const equipo = ticket.entrada.evento.productora.validadores;
    const validador = equipo.find((validador) => validador.userId === userId);
    if (!validador) {
      throw new UnauthorizedException(
        'No tienes permiso para validar este ticket',
      );
    }

    if (ticket.estado === EstadoTicket.VALIDADO) {
      throw new BadRequestException('El ticket ya fue validado');
    }

    if (ticket.estado !== EstadoTicket.PENDIENTE_VALIDACION) {
      throw new BadRequestException(
        'El ticket no está con el estado pendiente de validación',
      );
    }
    ticket.estado = EstadoTicket.VALIDADO;
    ticket.validatedBy = validador;
    await this.ticketsRepository.save(ticket);
  }

  /**
   * Devuelve los tickets asociados a un evento específico.
   * @param idEvento ID del evento.
   * @returns Lista de tickets asociados al evento.
   */
  async findTicketsByEvento(idEvento: number) {
    const tickets = await this.ticketsRepository.find({
      where: { entrada: { evento: { id: idEvento } } },
      relations: ['entrada', 'validatedBy'],
      order: { id: 'DESC' },
    });

    return { tickets };
  }
}
