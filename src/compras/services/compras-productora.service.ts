import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatioResponseDto } from 'src/commun/dto/pagination-response.dto';
import { PaginationDto } from 'src/commun/dto/pagination.dto';
import { Entrada } from 'src/eventos/entities/entrada.entity';
import { EstadoTicket } from 'src/tickets/enums/estado-ticket.enum';
import { TicketsService } from 'src/tickets/tickets.service';
import { DataSource, Not, Repository } from 'typeorm';
import { Compra } from '../entities/compra.entity';
import { EstadoCompra } from '../enums/estado-compra.enum';

@Injectable()
export class ComprasProductoraService {
  constructor(
    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,
    private readonly ticketsService: TicketsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene todas las compras realizadas para los eventos de una productora específica.
   * @param productoraId ID de la productora cuyas compras se desean obtener.
   * @returns Un array de compras relacionadas con los eventos de la productora.
   */
  async getComprasDeMisEventos(
    productoraId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatioResponseDto<Compra>> {
    const { limit = 10, page = 0 } = paginationDto;

    const [result, total] = await this.comprasRepository.findAndCount({
      where: {
        tickets: {
          entrada: { evento: { productora: { userId: productoraId } } },
        },
        estado: Not(EstadoCompra.INICIADA),
      },
      relations: [
        'cliente',
        'tickets',
        'tickets.entrada',
        'tickets.entrada.evento',
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: result,
      pagination: {
        total: total,
        page: page,
        hasNextPage: total > page * limit,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Rechaza una compra específica realizada para un evento de la productora.
   * Usa transacciones para garantizar la consistencia del stock.
   * @param productoraId ID de la productora que rechaza la compra.
   * @param compraId ID de la compra a rechazar.
   * @throws BadRequestException si la compra no existe o no pertenece a un evento de la productora.
   */
  async rechazarCompra(productoraId: number, compraId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtengo la compra con bloqueo para evitar modificaciones concurrentes
      const compra = await queryRunner.manager.findOne(Compra, {
        where: {
          id: compraId,
          tickets: {
            entrada: { evento: { productora: { userId: productoraId } } },
          },
        },
        relations: ['tickets', 'tickets.entrada', 'tickets.entrada.evento'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!compra) {
        throw new BadRequestException('La compra no existe.');
      }

      if (compra.estado !== EstadoCompra.PENDIENTE) {
        throw new BadRequestException(
          'La compra ya fue finalizada o cancelada.',
        );
      }

      // Cambio el estado de la compra
      await queryRunner.manager.update(
        Compra,
        { id: compraId },
        {
          estado: EstadoCompra.RECHAZADA,
        },
      );

      // Obtengo la cantidad de tickets por cada entrada
      const cantidadTicketsPorEntrada: { [key: number]: number } = {};
      compra.tickets.forEach((ticket) => {
        const entradaId = ticket.entrada.id;
        if (!cantidadTicketsPorEntrada[entradaId]) {
          cantidadTicketsPorEntrada[entradaId] = 0;
        }
        cantidadTicketsPorEntrada[entradaId]++;
      });

      // Actualizo el stock de cada entrada de forma atómica
      for (const entradaId in cantidadTicketsPorEntrada) {
        const cantidad = cantidadTicketsPorEntrada[entradaId];
        const entradaIdNum = parseInt(entradaId);

        // Busco el evento asociado para esta entrada
        const entrada = compra.tickets.find(
          (t) => t.entrada.id === entradaIdNum,
        )?.entrada;

        if (entrada) {
          // Incremento el stock de la entrada respetando el límite máximo
          await queryRunner.manager
            .createQueryBuilder()
            .update(Entrada)
            .set({
              stock: () => `LEAST(stock + ${cantidad}, cantidad)`,
            })
            .where('id = :id', { id: entradaIdNum })
            .execute();

          // Incremento el stock del evento respetando la capacidad máxima
          await queryRunner.manager
            .createQueryBuilder()
            .update('evento')
            .set({
              stockEntradas: () =>
                `LEAST(stockEntradas + ${cantidad}, capacidad)`,
            })
            .where('id = :eventoId', { eventoId: entrada.evento.id })
            .execute();
        }
      }

      // Actualizo el estado de los tickets
      await queryRunner.manager.update(
        'ticket',
        { compra: { id: compraId } },
        { estado: EstadoTicket.RECHAZADO },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Acepta una compra específica realizada para un evento de la productora.
   * @param productoraId ID de la productora que acepta la compra.
   * @param compraId ID de la compra a aceptar.
   * @throws BadRequestException si la compra no existe o no pertenece a un evento de la productora.
   */
  async aceptarCompra(productoraId: number, compraId: number): Promise<void> {
    const compra = await this.comprasRepository.findOne({
      where: {
        id: compraId,
        tickets: {
          entrada: { evento: { productora: { userId: productoraId } } },
        },
      },
    });

    if (!compra) {
      throw new BadRequestException('La compra no existe.');
    }

    if (compra.estado !== EstadoCompra.PENDIENTE) {
      throw new BadRequestException('La compra ya fue finalizada o cancelada.');
    }

    compra.estado = EstadoCompra.ACEPTADA;
    await this.comprasRepository.save(compra);

    await this.ticketsService.updateEstadoTicketsDeCompra(
      compra.id,
      EstadoTicket.PENDIENTE_VALIDACION,
    );
  }
}
