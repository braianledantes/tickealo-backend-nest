import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { EventosService } from 'src/eventos/eventos.service';
import { FileUploadService } from 'src/files/file-upload.service';
import { EstadoTicket } from 'src/tickets/enums/estado-ticket.enum';
import { Repository } from 'typeorm';
import { ComprarEntradaDto } from './dto/comprar-entrada.dto';
import { Compra } from './entities/compra.entity';
import { TicketsService } from 'src/tickets/tickets.service';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,
    private readonly clientesService: ClientesService,
    private readonly eventosService: EventosService,
    private readonly ticketsService: TicketsService,
    private readonly filesService: FileUploadService,
  ) {}

  async comprarEntrada(
    userId: number,
    comprarEntradaDto: ComprarEntradaDto,
    fileComprobanteTransferencia?: Express.Multer.File,
  ): Promise<Compra | null> {
    const { idEntrada, cant } = comprarEntradaDto;
    // verifico que exista el cliente
    const cliente = await this.clientesService.findOneById(userId);
    // verifico que exista la entrada y obtengo el evento
    const entrada = await this.eventosService.findEntradaById(idEntrada);
    // verifico que haya subido el comprobante de transferencia
    if (!fileComprobanteTransferencia) {
      throw new BadRequestException(
        'El comprobante de transferencia es obligatorio.',
      );
    }
    // verifico que el evento no haya finalizado
    const currentDate = new Date();
    if (entrada.evento.finAt < currentDate) {
      throw new BadRequestException(
        'No se pueden comprar entradas para eventos que ya han ocurrido.',
      );
    }

    // verifico que haya entradas disponibles
    const cantTicketsNoCancelados = entrada.tickets.reduce(
      (acc, ticket) =>
        ticket.estado !== EstadoTicket.COMPRA_CANCELADO ? acc : acc + 1,
      0,
    );
    const entradasDisponibles = entrada.cantidad - cantTicketsNoCancelados;
    if (entradasDisponibles < cant) {
      throw new BadRequestException(
        `No hay suficientes entradas disponibles. Quedan ${entradasDisponibles} entradas.`,
      );
    }

    // guardo el archivo del comprobante de transferencia
    const fileUrl = await this.filesService.saveImage(
      fileComprobanteTransferencia,
    );

    const montoTotal = Number(entrada.precio) * cant;

    const compra = this.comprasRepository.create({
      comprobanteTransferencia: fileUrl,
      monto: montoTotal,
      cliente: cliente,
    });

    const compraGuardada = await this.comprasRepository.save(compra);

    await this.ticketsService.saveTickets(
      cliente,
      entrada,
      compraGuardada,
      cant,
    );

    return this.comprasRepository.findOne({
      where: { id: compraGuardada.id },
      relations: ['tickets', 'cliente'],
    });
  }
}
