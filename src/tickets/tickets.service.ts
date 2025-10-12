import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Entrada } from 'src/eventos/entities/entrada.entity';
import { generarSiguienteCodigoAlfanumerico } from 'src/utils/codigos';
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
   * Guarda múltiples tickets en la base de datos, generando códigos alfanuméricos únicos.
   * @param cliente El cliente al que se le asignan los tickets.
   * @param entrada La entrada asociada a los tickets.
   * @param compra La compra asociada a los tickets.
   * @param cant La cantidad de tickets a generar y guardar.
   */
  async saveTickets(
    cliente: Cliente,
    entrada: Entrada,
    compra: Compra,
    cant: number,
  ): Promise<void> {
    const lastTicket = await this.ticketsRepository.findOne({
      where: {},
      order: { codigoAlfanumerico: 'DESC' },
    });
    let lastCode = '';
    if (lastTicket) {
      lastCode = lastTicket.codigoAlfanumerico;
    }

    const tickets: Ticket[] = [];
    for (let i = 0; i < cant; i++) {
      const codigoAlfanumerico = generarSiguienteCodigoAlfanumerico(lastCode);
      // creo el ticket
      const ticket = this.ticketsRepository.create({
        codigoAlfanumerico,
        cliente,
        entrada,
        compra,
      });
      tickets.push(ticket);

      lastCode = codigoAlfanumerico;
    }
    await this.ticketsRepository.save(tickets);
  }

  /**
   * Cancela los tickets asociados a una compra, cambiando su estado a COMPRA_CANCELADO.
   * @param compra La compra cuyos tickets se desean cancelar.
   */
  async cancelarTicketsDeCompra(compra: Compra): Promise<void> {
    await this.ticketsRepository.update(
      { compra: { id: compra.id } },
      { estado: EstadoTicket.COMPRA_CANCELADO },
    );
  }

  /**
   * Acepta los tickets asociados a una compra, cambiando su estado a PENDIENTE_VALIDACION.
   * @param compra La compra cuyos tickets se desean aceptar.
   */
  async aceptarTicketsDeCompra(compra: Compra): Promise<void> {
    await this.ticketsRepository.update(
      { compra: { id: compra.id } },
      { estado: EstadoTicket.PENDIENTE_VALIDACION },
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
    const esValidador = equipo.some((validador) => validador.userId === userId);
    if (!esValidador) {
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
    await this.ticketsRepository.save(ticket);
  }
}
