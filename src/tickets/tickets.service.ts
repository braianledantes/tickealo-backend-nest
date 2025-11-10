import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { MailService } from 'src/mail/mail.service';
import { DataSource, Repository } from 'typeorm';
import {
  EstadoTransferencia,
  TicketTransferencia,
} from './entities/ticket-transferencia.entity';
import { Ticket } from './entities/ticket.entity';
import { EstadoTicket } from './enums/estado-ticket.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(TicketTransferencia)
    private readonly transferenciasRepository: Repository<TicketTransferencia>,
    private readonly clientesService: ClientesService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
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
      relations: [
        'entrada',
        'validatedBy',
        'validatedBy.cliente',
        'validatedBy.cliente.user',
      ],
      order: { id: 'DESC' },
    });

    return { tickets };
  }

  /**
   * Devuelve los tickets asociados a un cliente específico.
   * @param userId ID del cliente.
   * @returns Lista de tickets asociados al cliente.
   */
  async getTicketsByCliente(userId: number) {
    const tickets = await this.ticketsRepository.find({
      where: { cliente: { userId: userId } },
      relations: [
        'entrada',
        'entrada.evento',
        'validatedBy',
        'validatedBy.cliente',
        'validatedBy.cliente.user',
      ],
      order: { id: 'DESC' },
    });

    return { tickets };
  }

  /**
   * Transfiere un ticket de un cliente emisor a un cliente receptor.
   * @param userId ID del cliente emisor.
   * @param ticketId ID del ticket a transferir.
   * @param receptorEmail Email del cliente receptor.
   * @throws UnauthorizedException si el cliente emisor no tiene permiso para transferir el ticket.
   * @throws NotFoundException si el cliente emisor, receptor o el ticket no existen.
   * @throws BadRequestException si el ticket no está en estado pendiente de validación,
   *         si el cliente emisor y receptor son el mismo, o si ya existe una transferencia pendiente.
   */
  async transferirTicket(
    userId: number,
    ticketId: number,
    receptorEmail: string,
  ) {
    const emisor = await this.clientesService.findOneById(userId);
    if (!emisor) {
      throw new UnauthorizedException('Usuario emisor no encontrado');
    }

    const receptor = await this.clientesService.findOneByEmail(receptorEmail);
    if (!receptor) {
      throw new NotFoundException('Usuario receptor no encontrado');
    }

    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['cliente', 'entrada', 'entrada.evento'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (ticket.cliente.userId !== emisor.userId) {
      throw new UnauthorizedException(
        'No tienes permiso para transferir este ticket',
      );
    }

    if (ticket.estado !== EstadoTicket.PENDIENTE_VALIDACION) {
      throw new BadRequestException(
        'El ticket no está con el estado pendiente de validación',
      );
    }

    if (emisor.userId === receptor.userId) {
      throw new BadRequestException(
        'No puedes transferir un ticket a ti mismo',
      );
    }

    const existingTransfer = await this.transferenciasRepository.exists({
      where: {
        clienteEmisor: { userId: emisor.userId },
        clienteReceptor: { userId: receptor.userId },
        ticket: { id: ticket.id },
        status: EstadoTransferencia.PENDIENTE,
      },
    });

    if (existingTransfer) {
      throw new BadRequestException(
        'Ya existe una transferencia pendiente para este ticket y receptor',
      );
    }

    const transferencia = this.transferenciasRepository.create({
      clienteEmisor: emisor,
      clienteReceptor: receptor,
      ticket: ticket,
    });

    await this.transferenciasRepository.save(transferencia);

    // Enviar email de notificación al receptor
    await this.mailService.sendTicketTransferNotification(
      receptor.user.email,
      receptor.nombre,
      emisor.nombre,
      ticket.entrada.evento.nombre,
      ticket.entrada.tipo,
      ticket.entrada.evento.inicioAt,
      transferencia.id,
    );
  }

  /**
   * Devuelve las transferencias de tickets recibidas por un cliente.
   * @param userId ID del cliente receptor.
   * @returns Lista de transferencias de tickets recibidas.
   */
  async findTransferenciasRecibidas(userId: number) {
    const transferencias = await this.transferenciasRepository.find({
      where: {
        clienteReceptor: { userId: userId },
      },
      relations: [
        'ticket',
        'clienteEmisor',
        'clienteReceptor',
        'ticket.entrada',
        'ticket.entrada.evento',
        'ticket.validatedBy',
        'ticket.validatedBy.cliente',
        'ticket.validatedBy.cliente.user',
      ],
      order: { createdAt: 'DESC' },
    });

    return { transferencias };
  }

  /**
   * Acepta una transferencia de ticket pendiente.
   * @param userId ID del cliente receptor que acepta la transferencia.
   * @param transferenciaId ID de la transferencia a aceptar.
   * @throws NotFoundException si la transferencia no existe.
   * @throws UnauthorizedException si el cliente receptor no tiene permiso para aceptar la transferencia.
   */
  async aceptarTransferencia(userId: number, transferenciaId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transferencia = await queryRunner.manager.findOne(
        TicketTransferencia,
        {
          where: { id: transferenciaId },
          relations: ['ticket', 'clienteReceptor'],
        },
      );

      if (!transferencia) {
        throw new NotFoundException('Transferencia no encontrada');
      }

      if (transferencia.clienteReceptor.userId !== userId) {
        throw new UnauthorizedException(
          'No tienes permiso para aceptar esta transferencia',
        );
      }

      transferencia.status = EstadoTransferencia.ACEPTADA;
      transferencia.ticket.cliente = transferencia.clienteReceptor;
      transferencia.ticket.compra = null;

      await queryRunner.manager.save(transferencia.ticket);
      await queryRunner.manager.save(transferencia);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
