import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { ILike, Repository } from 'typeorm';
import { CuentaBancariaService } from 'src/cuentabancaria/cuenta-bancaria.service';
import { LugaresService } from 'src/lugares/lugares.service';
import { FileUploadService } from 'src/files/file-upload.service';
import { PaginationDto } from 'src/commun/dto/pagination.dto';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    private readonly userService: UsersService,
    private readonly cuentaBancariaService: CuentaBancariaService,
    private readonly lugaresService: LugaresService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /** Crea un nuevo evento asociado a la productora del usuario.
   * @param userId ID del usuario que crea el evento.
   * @param createEventoDto Datos del evento a crear.
   * @param files Archivos de imagen (portada y banner) opcionales.
   * @returns El evento creado.
   * @throws UnauthorizedException si el usuario no es una productora.
   */
  async create(
    userId: number,
    createEventoDto: CreateEventoDto,
    files?: { portada?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    const productora = await this.userService.findProductoraByUserId(userId);
    const cuentaBancaria = await this.cuentaBancariaService.findById(
      createEventoDto.cuentaBancariaId,
    );

    if (!productora) {
      throw new UnauthorizedException('Productora not found');
    }

    const lugar = await this.lugaresService.upsert(createEventoDto.lugar);

    // Procesar archivos de imagen si están presentes
    let portadaUrl: string | undefined;
    let bannerUrl: string | undefined;

    if (files?.portada?.[0]) {
      portadaUrl = this.fileUploadService.saveImage(
        files.portada[0],
        'eventos',
      );
    }

    if (files?.banner?.[0]) {
      bannerUrl = this.fileUploadService.saveImage(files.banner[0], 'eventos');
    }

    const evento = this.eventoRepository.create({
      ...createEventoDto,
      lugar,
      productora,
      cuentaBancaria,
      portadaUrl,
      bannerUrl,
    });
    const eventoSaved = await this.eventoRepository.save(evento);
    return this.eventoRepository.findOne({
      where: { id: eventoSaved.id },
      relations: ['lugar', 'productora', 'cuentaBancaria'],
    });
  }

  /**
   * Devuelve una lista paginada de eventos, con soporte para búsqueda y ordenación.
   * @param search Término de búsqueda para filtrar eventos por nombre o descripción.
   * @param page Número de página (1-based).
   * @param limit Número de elementos por página.
   * @param orderDir Dirección de ordenación ('ASC' o 'DESC').
   * @returns Un objeto con los eventos paginados y metadatos.
   */
  async findAllPaginated(paginationDto: PaginationDto) {
    const { search, page, limit, orderDir } = paginationDto;
    const [result, total] = await this.eventoRepository.findAndCount({
      relations: ['lugar', 'productora'],
      skip: (page - 1) * limit,
      take: limit,
      where: search
        ? [
            { nombre: ILike(`%${search}%`) },
            { descripcion: ILike(`%${search}%`) },
          ]
        : {},
      order: { nombre: orderDir },
    });
    return {
      data: result,
      total,
      page,
      hasNextPage: total > page * limit,
      hasPreviousPage: page > 1,
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

  /** Actualiza un evento existente.
   * @param userId ID del usuario que intenta actualizar el evento.
   * @param id ID del evento a actualizar.
   * @param updateEventoDto Datos para actualizar el evento.
   * @param files Archivos de imagen (portada y banner) opcionales.
   * @returns El evento actualizado.
   * @throws NotFoundException si el evento no existe.
   * @throws UnauthorizedException si el usuario no tiene permiso para actualizar el evento.
   */
  async update(
    userId: number,
    id: number,
    updateEventoDto: UpdateEventoDto,
    files?: { portada?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
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

    // Procesar archivos de imagen si están presentes
    if (files?.portada?.[0]) {
      const portadaUrl = this.fileUploadService.saveImage(
        files.portada[0],
        'eventos',
      );
      evento.portadaUrl = portadaUrl;
    }

    if (files?.banner?.[0]) {
      const bannerUrl = this.fileUploadService.saveImage(
        files.banner[0],
        'eventos',
      );
      evento.bannerUrl = bannerUrl;
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
}
