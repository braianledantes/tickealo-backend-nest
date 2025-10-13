import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUploadService } from 'src/files/file-upload.service';
import { LugaresService } from 'src/lugares/lugares.service';
import { ProductoraService } from 'src/productora/services/productora.service';
import { Repository } from 'typeorm';
import { CreateEventoDto } from '../dto/create-evento.dto';
import { UpdateEventoDto } from '../dto/update-evento.dto';
import { Evento } from '../entities/evento.entity';

@Injectable()
export class EventosProductoraService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    private readonly productoraService: ProductoraService,
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

    if (!productora) {
      throw new UnauthorizedException('Productora not found');
    }

    if (!productora.cuentaBancaria) {
      throw new BadRequestException(
        'La productora debe tener una cuenta bancaria asociada',
      );
    }

    const lugar = await this.lugaresService.upsert(createEventoDto.lugar);

    const capacidad =
      createEventoDto.entradas?.reduce(
        (sum, entrada) => sum + entrada.cantidad,
        0,
      ) ?? 0;

    const entradas = (createEventoDto.entradas ?? []).map((entrada) => ({
      ...entrada,
      stock: entrada.cantidad,
    }));

    const evento = this.eventoRepository.create({
      ...createEventoDto,
      capacidad,
      stockEntradas: capacidad,
      lugar,
      productora,
      cuentaBancaria: productora.cuentaBancaria,
      entradas,
    });
    const eventoSaved = await this.eventoRepository.save(evento);
    return this.eventoRepository.findOne({
      where: { id: eventoSaved.id },
      relations: ['lugar', 'productora', 'cuentaBancaria', 'entradas'],
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

    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['lugar', 'productora', 'cuentaBancaria', 'entradas'],
    });
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

    const eventoActualizado = await this.eventoRepository.findOne({
      where: { id },
      relations: ['lugar', 'productora', 'cuentaBancaria', 'entradas'],
    });
    if (!eventoActualizado) {
      throw new NotFoundException('Evento not found');
    }
    return eventoActualizado;
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

    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['productora'],
    });
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

    const eventoActualizado = await this.eventoRepository.findOne({
      where: { id },
      relations: ['lugar', 'productora', 'cuentaBancaria', 'entradas'],
    });
    if (!eventoActualizado) {
      throw new NotFoundException('Evento not found');
    }
    return eventoActualizado;
  }

  /** Elimina un evento por su ID.
   * @param userId ID del usuario que intenta eliminar el evento.
   * @param id ID del evento a eliminar.
   * @throws NotFoundException si el evento no existe.
   * @throws UnauthorizedException si el usuario no tiene permiso para eliminar el evento.
   */
  async remove(userId: number, id: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['productora', 'entradas', 'entradas.tickets'],
    });
    if (!evento) {
      throw new NotFoundException('Evento not found');
    }

    if (evento.productora.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to delete this evento',
      );
    }

    // Si el evento tiene tickets vendidos, no se puede eliminar
    const hasTicketsVendidos = evento.entradas.some(
      (entrada) => entrada.tickets && entrada.tickets.length > 0,
    );
    if (hasTicketsVendidos) {
      throw new BadRequestException(
        'No se puede eliminar un evento con tickets vendidos',
      );
    }
    await this.eventoRepository.remove(evento);
  }
}
