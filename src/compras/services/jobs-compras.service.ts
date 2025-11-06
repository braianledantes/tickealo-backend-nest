import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Entrada } from 'src/eventos/entities/entrada.entity';
import { Evento } from 'src/eventos/entities/evento.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { DataSource, In, LessThan } from 'typeorm';
import { Compra } from '../entities/compra.entity';
import { EstadoCompra } from '../enums/estado-compra.enum';

@Injectable()
export class JobsComprasService {
  private readonly logger = new Logger(JobsComprasService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Elimina las compras que están en estado INICIADA y que fueron creadas hace más de 1 hora.
   * Este job se ejecuta cada 1 minuto.
   */
  @Cron('* * * * *')
  async eliminarComprasNoFinalizadas() {
    const tiempoLimite = 60 * 60 * 1000;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // obtengo la fecha límite
      const resNow: { now: Date }[] = await this.dataSource.manager.query(
        'SELECT NOW() AS now',
      );
      const now = resNow[0].now.getTime();
      const fechaLimite = new Date(now - tiempoLimite);

      // Primero verificar cuántas compras INICIADA hay en total
      const comprasNoFinalizadas = await queryRunner.manager.find(Compra, {
        where: {
          estado: EstadoCompra.INICIADA,
          createdAt: LessThan(fechaLimite),
        },
        relations: ['tickets', 'tickets.entrada', 'tickets.entrada.evento'],
      });

      // elimina los tickets
      for (const compra of comprasNoFinalizadas) {
        const ticketIds = compra.tickets.map((ticket) => ticket.id);
        if (ticketIds.length > 0) {
          await queryRunner.manager.delete(Ticket, {
            id: In(ticketIds),
          });

          // Actualiza el stock de las entradas asociadas a los tickets eliminados
          const entradaMap = new Map<number, number>(); // Mapa para contar tickets por entrada
          for (const ticket of compra.tickets) {
            const entradaId = ticket.entrada.id;
            entradaMap.set(entradaId, (entradaMap.get(entradaId) || 0) + 1);
          }
          for (const [entradaId, cantidad] of entradaMap.entries()) {
            await queryRunner.manager.increment(
              Entrada,
              { id: entradaId },
              'stock',
              cantidad,
            );
          }
        }

        // Actualiza el stock del evento asociado a la entrada de los tickets eliminados
        await queryRunner.manager.increment(
          Evento,
          { id: compra.tickets[0].entrada.evento.id },
          'stockEntradas',
          compra.tickets.length,
        );

        // elimina la compra
        await queryRunner.manager.delete(Compra, { id: compra.id });
      }
      await queryRunner.commitTransaction();

      if (comprasNoFinalizadas.length > 0) {
        const cantTicketsEliminados = comprasNoFinalizadas.reduce(
          (sum, compra) => sum + compra.tickets.length,
          0,
        );

        this.logger.log(
          `Se eliminaron ${comprasNoFinalizadas.length} compras no finalizadas y ${cantTicketsEliminados} tickets asociados.`,
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof Error) {
        this.logger.error(
          `Error al eliminar compras no finalizadas: ${error.message}`,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
