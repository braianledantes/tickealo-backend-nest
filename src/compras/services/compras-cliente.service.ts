import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { PaginatioResponseDto } from 'src/commun/dto/pagination-response.dto';
import { PaginationDto } from 'src/commun/dto/pagination.dto';
import { Entrada } from 'src/eventos/entities/entrada.entity';
import { FileUploadService } from 'src/files/file-upload.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { EstadoTicket } from 'src/tickets/enums/estado-ticket.enum';
import { TicketsService } from 'src/tickets/tickets.service';
import { generarSiguienteCodigoAlfanumerico } from 'src/utils/codigos';
import { DataSource, Not, Repository } from 'typeorm';
import { ComprarEntradaDto } from '../dto/comprar-entrada.dto';
import { Compra } from '../entities/compra.entity';
import { EstadoCompra } from '../enums/estado-compra.enum';

@Injectable()
export class ComprasClienteService {
  constructor(
    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,
    private readonly clientesService: ClientesService,
    private readonly ticketsService: TicketsService,
    private readonly filesService: FileUploadService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Permite a un cliente comprar entradas para un evento específico.
   * Implementa transacciones atómicas con bloqueo pessimista para evitar race conditions.
   * @param userId ID del cliente que realiza la compra.
   * @param comprarEntradaDto DTO que contiene el ID de la entrada y la cantidad a comprar.
   * @returns La compra realizada, incluyendo los tickets generados.
   * @throws BadRequestException si el cliente no existe, la entrada no existe, no se proporciona el comprobante,
   *         el evento ya ha finalizado o no hay suficientes entradas disponibles.
   */
  async iniciarComprarEntrada(
    userId: number,
    comprarEntradaDto: ComprarEntradaDto,
  ): Promise<Compra | null> {
    const { idEntrada, cant } = comprarEntradaDto;

    // Iniciamos una transacción para garantizar atomicidad
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // verifico que exista el cliente (fuera de la transacción porque no se modifica)
      const cliente = await this.clientesService.findOneById(userId);

      // Obtengo la entrada con bloqueo pessimista para evitar modificaciones concurrentes
      const entrada = await queryRunner.manager.findOne(Entrada, {
        where: { id: idEntrada },
        relations: ['evento'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!entrada) {
        throw new NotFoundException('La entrada no existe.');
      }

      // verifico que el evento no haya finalizado
      const currentDate = new Date();
      if (entrada.evento.finAt < currentDate) {
        throw new BadRequestException(
          'No se pueden comprar entradas porque el evento ya ha finalizado.',
        );
      }

      // Verifico stock con el dato bloqueado (crítico para evitar overselling)
      if (entrada.stock < cant) {
        throw new BadRequestException(
          `No hay suficientes entradas disponibles. Quedan ${entrada.stock} entradas.`,
        );
      }

      const montoTotal = Number(entrada.precio) * cant;

      // Creo la compra dentro de la transacción
      const compra = queryRunner.manager.create(Compra, {
        monto: montoTotal,
        cliente: cliente,
      });

      const compraGuardada = await queryRunner.manager.save(compra);

      // Creo los tickets dentro de la transacción
      const lastTicket = await queryRunner.manager.findOne(Ticket, {
        where: {},
        order: { codigoAlfanumerico: 'DESC' },
        lock: { mode: 'pessimistic_read' },
      });

      let lastCode = '';
      if (lastTicket) {
        lastCode = lastTicket.codigoAlfanumerico;
      }

      const tickets: Ticket[] = [];
      for (let i = 0; i < cant; i++) {
        const codigoAlfanumerico = generarSiguienteCodigoAlfanumerico(lastCode);
        // creo el ticket usando el manager de la transacción
        const ticket = queryRunner.manager.create(Ticket, {
          codigoAlfanumerico,
          cliente,
          entrada,
          compra,
        });
        tickets.push(ticket);

        lastCode = codigoAlfanumerico;
      }
      await queryRunner.manager.save(tickets);

      // Decremento el stock de manera atómica dentro de la transacción
      await queryRunner.manager.decrement(
        Entrada,
        { id: idEntrada },
        'stock',
        cant,
      );

      // También actualizo el stock del evento
      await queryRunner.manager.decrement(
        'evento',
        { id: entrada.evento.id },
        'stockEntradas',
        cant,
      );

      // Confirmo la transacción
      await queryRunner.commitTransaction();

      // Retorno la compra con sus relaciones
      return this.comprasRepository.findOne({
        where: { id: compraGuardada.id },
        relations: ['tickets', 'cliente'],
      });
    } catch (error) {
      // Si algo falla, revierto toda la transacción
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Libero el query runner
      await queryRunner.release();
    }
  }

  /**
   * Finaliza una compra de entradas, permitiendo al cliente subir un comprobante de transferencia.
   * @param userId ID del cliente que finaliza la compra.
   * @param compraId ID de la compra a finalizar.
   * @param fileComprobanteTransferencia Archivo del comprobante de transferencia (opcional).
   * @returns La compra actualizada con el estado pendiente y el comprobante.
   * @throws ForbiddenException si el usuario no tiene permiso para finalizar la compra.
   * @throws BadRequestException si el usuario o la compra no existen.
   * @throws BadRequestException si no se proporciona el comprobante de transferencia.
   * @throws BadRequestException si el usuario o la compra no existen.
   */
  async finalizarCompraEntrada(
    userId: number,
    compraId: number,
    fileComprobanteTransferencia?: Express.Multer.File,
  ) {
    if (!fileComprobanteTransferencia) {
      throw new BadRequestException(
        'El comprobante de transferencia es obligatorio.',
      );
    }

    const compra = await this.comprasRepository.findOne({
      where: { id: compraId },
      relations: ['tickets', 'cliente'],
    });

    if (!compra) {
      throw new NotFoundException('La compra no existe.');
    }

    if (compra.estado !== EstadoCompra.INICIADA) {
      throw new BadRequestException('La compra ya fue finalizada o cancelada.');
    }

    const cliente = await this.clientesService.findOneById(userId);
    if (cliente.userId !== compra.cliente.userId) {
      throw new ForbiddenException(
        'No tienes permiso para finalizar esta compra.',
      );
    }

    // guardo el archivo del comprobante de transferencia
    const fileUrl = await this.filesService.saveImage(
      fileComprobanteTransferencia,
    );
    compra.comprobanteTransferencia = fileUrl;

    compra.estado = EstadoCompra.PENDIENTE;

    const compraGuardada = await this.comprasRepository.save(compra);
    await this.ticketsService.updateEstadoTicketsDeCompra(
      compra.id,
      EstadoTicket.COMPRA_PENDIENTE,
    );

    return compraGuardada;
  }

  /**
   * Obtiene todas las compras realizadas por un cliente específico.
   * @param clienteId ID del cliente cuyas compras se desean obtener.
   * @returns Un array de compras realizadas por el cliente.
   */
  async getComprasDeCliente(
    clienteId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatioResponseDto<Compra>> {
    const { limit = 10, page = 0 } = paginationDto;

    const [result, total] = await this.comprasRepository.findAndCount({
      where: {
        cliente: { userId: clienteId },
        estado: Not(EstadoCompra.INICIADA),
      },
      relations: [
        'tickets',
        'tickets.entrada',
        'tickets.entrada.evento',
        'tickets.entrada.evento.lugar',
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
}
