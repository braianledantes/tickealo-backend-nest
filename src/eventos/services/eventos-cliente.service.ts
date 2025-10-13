import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatioResponseDto } from 'src/commun/dto/pagination-response.dto';
import { checkWithinArea } from 'src/utils/filters';
import { ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { FindEventosDto } from '../dto/find-eventos.dto';
import { Evento } from '../entities/evento.entity';

@Injectable()
export class EventosClienteService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
  ) {}

  /**
   * Devuelve una lista paginada de eventos, con soporte para búsqueda y ordenación.
   * @param findEventosDto Parámetros de búsqueda, paginación y ordenación.
   * @returns Un objeto con los eventos paginados y metadatos.
   */
  async findAllPaginated(
    findEventosDto: FindEventosDto,
  ): Promise<PaginatioResponseDto<Evento>> {
    const {
      search,
      page,
      limit,
      orderDir,
      fechaInicio,
      fechaFin,
      latitud,
      longitud,
      radioKm,
    } = findEventosDto;

    // Construir las condiciones de búsqueda por texto
    const textSearchConditions = search
      ? [
          { nombre: ILike(`%${search}%`) },
          { descripcion: ILike(`%${search}%`) },
        ]
      : undefined;

    // Construir las condiciones de fecha
    const dateConditions: Record<string, any> = {};
    if (fechaInicio && fechaFin) {
      // Eventos que se superponen con el rango de fechas
      dateConditions.inicioAt = LessThanOrEqual(fechaFin);
      dateConditions.finAt = MoreThanOrEqual(fechaInicio);
    } else if (fechaInicio) {
      // Eventos que terminan después de la fecha de inicio
      dateConditions.finAt = MoreThanOrEqual(fechaInicio);
    } else if (fechaFin) {
      // Eventos que empiezan antes de la fecha de fin
      dateConditions.inicioAt = LessThanOrEqual(fechaFin);
    }

    // Combinar condiciones de texto y fecha
    let whereConditions: any;
    if (textSearchConditions && Object.keys(dateConditions).length > 0) {
      // Si hay búsqueda por texto y filtros de fecha, combinar ambos
      whereConditions = textSearchConditions.map((condition) => ({
        ...condition,
        ...dateConditions,
      }));
    } else if (textSearchConditions) {
      // Solo búsqueda por texto
      whereConditions = textSearchConditions;
    } else if (Object.keys(dateConditions).length > 0) {
      // Solo filtros de fecha
      whereConditions = dateConditions;
    } else {
      // Sin filtros
      whereConditions = {};
    }

    const [result, total] = await this.eventoRepository.findAndCount({
      relations: ['lugar', 'productora', 'cuentaBancaria', 'entradas'],
      skip: (page - 1) * limit,
      take: limit,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: whereConditions,
      order: { nombre: orderDir },
    });

    // Aplicar filtro de ubicación geográfica si se proporcionan coordenadas
    let filteredResult = result;
    if (
      latitud !== undefined &&
      longitud !== undefined &&
      radioKm !== undefined
    ) {
      filteredResult = result.filter((evento) =>
        checkWithinArea(
          { latitud: evento.lugar.latitud, longitud: evento.lugar.longitud },
          latitud,
          longitud,
          radioKm,
        ),
      );
    }

    // Nota: El filtro geográfico se aplica después de la consulta DB,
    // por lo que el total puede no ser exacto para la paginación
    const hasGeographicFilter =
      latitud !== undefined && longitud !== undefined && radioKm !== undefined;

    const finalTotal = hasGeographicFilter ? filteredResult.length : total;

    return {
      data: filteredResult,
      pagination: {
        total: finalTotal,
        page,
        hasNextPage: hasGeographicFilter
          ? filteredResult.length > page * limit
          : total > page * limit,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Devuelve un evento por su ID, incluyendo si el cliente lo sigue.
   * @param userId ID del usuario que solicita el evento (para verificar si sigue a la productora).
   * @param id ID del evento a buscar.
   * @returns El evento encontrado con información de seguimiento.
   * @throws NotFoundException si el evento no existe.
   */
  async findOne(userId: number, id: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: [
        'lugar',
        'productora',
        'cuentaBancaria',
        'entradas',
        'productora.seguidores',
      ],
    });
    if (!evento) {
      throw new NotFoundException('Evento not found');
    }
    const isSeguido = evento.productora.seguidores.some(
      (cliente) => cliente.userId === userId,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { seguidores, ...productoraData } = evento.productora;

    return {
      ...evento,
      productora: {
        ...productoraData,
        isSeguido,
      },
    };
  }

  /**
   * Devuelve los eventos cuya fecha de inicio es posterior a la fecha actual.
   * Ordenados de más próximos a más lejanos.
   * @returns Lista de eventos futuros.
   */
  async findUpcoming() {
    const now = new Date();

    return this.eventoRepository.find({
      where: { inicioAt: MoreThanOrEqual(now) },
      relations: ['lugar', 'productora', 'cuentaBancaria', 'entradas'],
      order: { inicioAt: 'ASC' },
    });
  }
}
