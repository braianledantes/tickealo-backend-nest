import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { PaginatioResponseDto } from 'src/commun/dto/pagination-response.dto';
import { PaginationDto } from 'src/commun/dto/pagination.dto';
import { EventosService } from 'src/eventos/eventos.service';
import { FileUploadService } from 'src/files/file-upload.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { EstadoTicket } from 'src/tickets/enums/estado-ticket.enum';
import { TicketsService } from 'src/tickets/tickets.service';
import { generarSiguienteCodigoAlfanumerico } from 'src/utils/codigos';
import { DataSource, Repository } from 'typeorm';
import { ComprarEntradaDto } from './dto/comprar-entrada.dto';
import { Compra } from './entities/compra.entity';
import { EstadoCompra } from './enums/estado-compra.enum';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,
    private readonly clientesService: ClientesService,
    private readonly eventosService: EventosService,
    private readonly ticketsService: TicketsService,
    private readonly filesService: FileUploadService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Permite a un cliente comprar entradas para un evento específico.
   * @param userId ID del cliente que realiza la compra.
   * @param comprarEntradaDto DTO que contiene el ID de la entrada y la cantidad a comprar.
   * @param fileComprobanteTransferencia Archivo opcional que contiene el comprobante de transferencia.
   * @returns La compra realizada, incluyendo los tickets generados.
   * @throws BadRequestException si el cliente no existe, la entrada no existe, no se proporciona el comprobante,
   *         el evento ya ha finalizado o no hay suficientes entradas disponibles.
   */
  async comprarEntrada(
    userId: number,
    comprarEntradaDto: ComprarEntradaDto,
    fileComprobanteTransferencia?: Express.Multer.File,
  ): Promise<Compra | null> {
    const { idEntrada, cant } = comprarEntradaDto;

    // Crear un query runner para manejar la transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      const compra = queryRunner.manager.create(Compra, {
        comprobanteTransferencia: fileUrl,
        monto: montoTotal,
        cliente: cliente,
      });

      const compraGuardada = await queryRunner.manager.save(compra);

      // Crear y guardar los tickets dentro de la transacción
      const lastTicket = await queryRunner.manager.findOne(Ticket, {
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

        const ticket = queryRunner.manager.create(Ticket, {
          codigoAlfanumerico,
          cliente,
          entrada,
          compra: compraGuardada,
        });
        tickets.push(ticket);
        lastCode = codigoAlfanumerico;
      }

      await queryRunner.manager.save(Ticket, tickets);

      // Confirmar la transacción
      await queryRunner.commitTransaction();

      return this.comprasRepository.findOne({
        where: { id: compraGuardada.id },
        relations: ['tickets', 'cliente'],
      });
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberar el query runner
      await queryRunner.release();
    }
  }

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
      },
      relations: ['cliente', 'tickets'],
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
   * Cancela una compra específica realizada para un evento de la productora.
   * @param productoraId ID de la productora que solicita la cancelación.
   * @param compraId ID de la compra a cancelar.
   * @throws BadRequestException si la compra no existe o no pertenece a un evento de la productora.
   */
  async cancelarCompra(productoraId: number, compraId: number): Promise<void> {
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

    compra.estado = EstadoCompra.CANCELADA;
    await this.comprasRepository.save(compra);

    await this.ticketsService.cancelarTicketsDeCompra(compra);
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

    compra.estado = EstadoCompra.COMPLETADA;
    await this.comprasRepository.save(compra);

    await this.ticketsService.aceptarTicketsDeCompra(compra);
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
      where: { cliente: { userId: clienteId } },
      relations: ['tickets', 'tickets.entrada'],
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
   * Obtiene una compra por su ID, asegurándose de que el usuario tenga acceso a ella.
   * Un usuario puede acceder a una compra si es el cliente que la realizó o si es la productora del evento asociado a la compra.
   * @param userId ID del usuario que solicita la compra.
   * @param compraId ID de la compra a obtener.
   * @returns La compra solicitada si el usuario tiene acceso a ella.
   * @throws BadRequestException si la compra no existe o el usuario no tiene acceso a ella.
   */
  async getCompra(userId: number, compraId: number): Promise<Compra> {
    const compra = await this.comprasRepository.findOne({
      where: [
        { id: compraId, cliente: { userId } },
        {
          id: compraId,
          tickets: {
            entrada: { evento: { productora: { userId } } },
          },
        },
      ],
      relations: ['cliente', 'tickets', 'tickets.entrada'],
    });

    if (!compra) {
      throw new BadRequestException('La compra no existe o no tienes acceso.');
    }
    return compra;
  }
}
