import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CuentaBancariaService } from 'src/cuentabancaria/cuenta-bancaria.service';
import { FileUploadService } from 'src/files/file-upload.service';
import { LugaresService } from 'src/lugares/lugares.service';
import { ProductoraService } from 'src/productora/productora.service';
import { checkWithinArea } from 'src/utils/filters';
import { ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateEventoDto } from './dto/create-evento.dto';
import { FindEventosDto } from './dto/find-eventos.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './entities/evento.entity';
import { Entrada } from './entities/entrada.entity';
import { PaginatioResponseDto } from 'src/commun/dto/pagination-response.dto';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(Entrada)
    private readonly entradaRepository: Repository<Entrada>,
    private readonly productoraService: ProductoraService,
    private readonly cuentaBancariaService: CuentaBancariaService,
    private readonly lugaresService: LugaresService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /** Crea un nuevo evento asociado a la productora del usuario.
   * @param userId ID del usuario que crea el evento.
   * @param createEventoDto Datos del evento a crear.
   * @returns El evento creado.
   * @throws UnauthorizedException si el usuario no es una productora.
   * @throws BadRequestException si las fechas son inválidas.
   */
  async create(userId: number, createEventoDto: CreateEventoDto) {
    if (createEventoDto.inicioAt >= createEventoDto.finAt) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    const productora = await this.productoraService.findOneByUserId(userId);
    const cuentaBancaria = await this.cuentaBancariaService.findById(
      createEventoDto.cuentaBancariaId,
    );

    if (!productora) {
      throw new UnauthorizedException('Productora not found');
    }

    const lugar = await this.lugaresService.upsert(createEventoDto.lugar);

    const evento = this.eventoRepository.create({
      ...createEventoDto,
      lugar,
      productora,
      cuentaBancaria,
    });
    const eventoSaved = await this.eventoRepository.save(evento);
    return this.eventoRepository.findOne({
      where: { id: eventoSaved.id },
      relations: ['lugar', 'productora', 'cuentaBancaria'],
    });
  }

  /**
   * Actualiza las imágenes (portada y banner) de un evento existente.
   * @param userId ID del usuario que intenta actualizar las imágenes.
   * @param id ID del evento a actualizar.
   * @param files Archivos de imagen (portada y banner) opcionales.
   * @returns El evento actualizado con las nuevas URLs de las imágenes.
   * @throws NotFoundException si el evento no existe.
   * @throws UnauthorizedException si el usuario no tiene permiso para actualizar el evento.
   */
  async updateImagenes(
    userId: number,
    id: number,
    files?: {
      portada?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const productora = await this.productoraService.findOneByUserId(userId);

    if (!productora) {
      throw new UnauthorizedException('Productora not found');
    }

    const evento = await this.findOne(id);
    if (!evento) {
      throw new NotFoundException('Evento not found');
    }

    if (evento.productora.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this evento',
      );
    }

    // Procesar archivos de imagen si están presentes
    let portadaUrl: string | undefined;
    let bannerUrl: string | undefined;

    if (files?.portada?.[0]) {
      portadaUrl = await this.fileUploadService.saveImage(files.portada[0]);
    }

    if (files?.banner?.[0]) {
      bannerUrl = await this.fileUploadService.saveImage(files.banner[0]);
    }

    Object.assign(evento, { portadaUrl, bannerUrl });
    await this.eventoRepository.save(evento);
    return this.findOne(id);
  }

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
      relations: ['lugar', 'productora'],
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

  /** Devuelve un evento por su ID.
   * @param id ID del evento a buscar.
   * @returns El evento encontrado.
   * @throws NotFoundException si el evento no existe.
   */
  async findOne(id: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['lugar', 'productora', 'cuentaBancaria'],
    });
    if (!evento) {
      throw new NotFoundException('Evento not found');
    }
    return evento;
  }

  /**
   * Devuelve una entrada por su ID.
   * @param id ID de la entrada a buscar.
   * @returns La entrada encontrada.
   * @throws NotFoundException si la entrada no existe.
   */
  async findEntradaById(id: number): Promise<Entrada> {
    const entrada = await this.entradaRepository.findOne({
      where: { id },
      relations: ['evento', 'tickets'],
    });
    if (!entrada) {
      throw new NotFoundException('Entrada not found');
    }
    return entrada;
  }

  /** Actualiza un evento existente.
   * @param userId ID del usuario que intenta actualizar el evento.
   * @param id ID del evento a actualizar.
   * @param updateEventoDto Datos para actualizar el evento.
   * @returns El evento actualizado.
   * @throws NotFoundException si el evento no existe.
   * @throws UnauthorizedException si el usuario no tiene permiso para actualizar el evento.
   */
  async update(userId: number, id: number, updateEventoDto: UpdateEventoDto) {
    if (
      updateEventoDto.inicioAt &&
      updateEventoDto.finAt &&
      updateEventoDto.inicioAt >= updateEventoDto.finAt
    ) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    const evento = await this.findOne(id);
    if (!evento) {
      throw new NotFoundException('Evento not found');
    }

    if (evento.productora.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this evento',
      );
    }

    if (updateEventoDto.lugar) {
      const lugar = await this.lugaresService.upsert(updateEventoDto.lugar);
      evento.lugar = lugar;
    }

    Object.assign(evento, updateEventoDto);
    await this.eventoRepository.save(evento);
    return this.findOne(id);
  }

  /** Elimina un evento por su ID.
   * @param userId ID del usuario que intenta eliminar el evento.
   * @param id ID del evento a eliminar.
   * @throws NotFoundException si el evento no existe.
   * @throws UnauthorizedException si el usuario no tiene permiso para eliminar el evento.
   */
  async remove(userId: number, id: number) {
    const evento = await this.findOne(id);
    if (!evento) {
      throw new NotFoundException('Evento not found');
    }

    if (evento.productora.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to delete this evento',
      );
    }
    await this.eventoRepository.remove(evento);
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
      relations: ['lugar', 'productora', 'cuentaBancaria'],
      order: { inicioAt: 'ASC' },
    });
  }
}
