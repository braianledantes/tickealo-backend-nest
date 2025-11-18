import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Entrada } from 'src/eventos/entities/entrada.entity';
import { Evento } from 'src/eventos/entities/evento.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { DataSource, In, LessThan } from 'typeorm';
import { Compra } from '../entities/compra.entity';
import { Punto } from '../entities/punto.entity';
import { EstadoCompra } from '../enums/estado-compra.enum';

@Injectable()
export class JobsComprasService {
  private readonly logger = new Logger(JobsComprasService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Elimina los creaditos que han expirado.
   */
  @Cron('0 0 * * *') // Se ejecuta todos los días a la medianoche
  async eliminarCreditosExpirados() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // obtengo la fecha límite
      const resNow: { now: Date }[] = await this.dataSource.manager.query(
        'SELECT NOW() AS now',
      );
      const now = resNow[0].now.getTime();

      // Encuentra todos los puntos que han expirado
      const puntosExpirados = await queryRunner.manager.find(Punto, {
        where: {
          fechaVencimiento: LessThan(new Date(now)),
        },
        relations: ['cliente'],
      });

      // Resta los puntos expirados de los clientes correspondientes
      for (const punto of puntosExpirados) {
        const cliente: Cliente = punto.cliente;
        cliente.puntosAcumulados -= punto.puntosObtenidos;

        // Asegurarse de que los puntos acumulados no sean negativos
        if (cliente.puntosAcumulados < 0) {
          cliente.puntosAcumulados = 0;
        }

        await queryRunner.manager.save(cliente);
        await queryRunner.manager.delete(Punto, { id: punto.id });
      }
      await queryRunner.commitTransaction();

      if (puntosExpirados.length > 0) {
        this.logger.log(
          `Se eliminaron ${puntosExpirados.length} créditos expirados.`,
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof Error) {
        this.logger.error(
          `Error al eliminar créditos expirados: ${error.message}`,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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
        relations: [
          'tickets',
          'tickets.entrada',
          'tickets.entrada.evento',
          'cliente',
          'punto',
        ],
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

        // restaura los puntos usados en la compra si los hubiera
        const cliente = compra.cliente;

        cliente.puntosAcumulados -= compra.punto.puntosObtenidos;
        if (cliente.puntosAcumulados < 0) {
          cliente.puntosAcumulados = 0;
        }
        await queryRunner.manager.save(cliente);

        await queryRunner.manager.delete(Punto, { id: compra.punto.id });

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
