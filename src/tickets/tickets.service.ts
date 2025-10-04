import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Compra } from 'src/compras/entities/compra.entity';
import { Entrada } from 'src/eventos/entities/entrada.entity';
import { generarSiguienteCodigoAlfanumerico } from 'src/utils/codigos';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async saveTickets(
    cliente: Cliente,
    entrada: Entrada,
    compra: Compra,
    cant: number,
  ) {
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
}
