import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
