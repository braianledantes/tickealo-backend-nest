import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Entrada } from 'src/eventos/entities/entrada.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { DataSource, In, LessThan } from 'typeorm';
import { Compra } from '../entities/compra.entity';
import { EstadoCompra } from '../enums/estado-compra.enum';

@Injectable()
export class JobsComprasService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Elimina las compras que están en estado INICIADA y que fueron creadas hace más de 1 hora.
   * Este job se ejecuta cada media hora.
   */
  @Cron('0 */30 * * * *')
  async eliminarComprasNoFinalizadas() {
    const tiempoLimite = 60 * 60 * 1000;
    const fechaLimite = new Date(Date.now() - tiempoLimite);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Primero verificar cuántas compras INICIADA hay en total
      const comprasNoFinalizadas = await queryRunner.manager.find(Compra, {
        where: {
          estado: EstadoCompra.INICIADA,
          createdAt: LessThan(fechaLimite),
        },
        relations: ['tickets', 'tickets.entrada'],
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

        // elimina la compra
        await queryRunner.manager.delete(Compra, { id: compra.id });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
