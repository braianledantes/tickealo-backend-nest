import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { Evento } from 'src/eventos/entities/evento.entity';
import { Repository } from 'typeorm';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Comentario } from './entities/comentario.entity';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentariosRepository: Repository<Comentario>,
    @InjectRepository(Evento)
    private readonly eventosRepository: Repository<Evento>,
    private readonly clientesService: ClientesService,
  ) {}

  /**
   * Crea un nuevo comentario para un evento específico.
   * @param userId - ID del usuario que crea el comentario.
   * @param eventoId - ID del evento al que se asocia el comentario.
   * @param createComentarioDto - Datos del comentario a crear.
   * @returns El comentario creado.
   * @throws NotFoundException si el evento no existe.
   * @throws BadRequestException si el evento ya ha finalizado.
   */
  async create(
    userId: number,
    eventoId: number,
    createComentarioDto: CreateComentarioDto,
  ): Promise<Comentario> {
    const cliente = await this.clientesService.findOneById(userId);

    const evento = await this.eventosRepository.findOneBy({
      id: eventoId,
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    if (evento.finAt < new Date()) {
      throw new BadRequestException(
        'No se pueden agregar comentarios a eventos finalizados',
      );
    }

    const comentario = this.comentariosRepository.create({
      comentario: createComentarioDto.comentario,
      calificacion: createComentarioDto.calificacion,
      evento: evento,
      cliente: cliente,
    });

    return this.comentariosRepository.save(comentario);
  }

  /**
   * Obtiene todos los comentarios asociados a un evento específico.
   * @param eventoId - ID del evento cuyos comentarios se desean obtener.
   * @returns Una lista de comentarios asociados al evento.
   * @throws NotFoundException si el evento no existe.
   */
  async findAll(eventoId: number): Promise<Comentario[]> {
    const evento = await this.eventosRepository.findOneBy({
      id: eventoId,
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    return this.comentariosRepository.find({
      where: { evento: { id: eventoId } },
      relations: ['cliente', 'cliente.user'],
    });
  }

  /**
   * Obtiene un comentario por su ID.
   * @param id - ID del comentario a obtener.
   * @returns El comentario correspondiente al ID proporcionado.
   * @throws NotFoundException si el comentario no existe.
   */
  async findOne(id: number): Promise<Comentario> {
    const comentario = await this.comentariosRepository.findOne({
      where: { id },
      relations: ['cliente', 'cliente.user'],
    });

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comentario;
  }

  /**
   * Actualiza un comentario existente.
   * @param userId - ID del usuario que intenta actualizar el comentario.
   * @param id - ID del comentario a actualizar.
   * @param updateComentarioDto - Datos para actualizar el comentario.
   * @returns El comentario actualizado.
   * @throws NotFoundException si el comentario no existe.
   * @throws UnauthorizedException si el usuario no es el propietario del comentario.
   */
  async update(
    userId: number,
    id: number,
    updateComentarioDto: UpdateComentarioDto,
  ): Promise<Comentario> {
    const comentario = await this.comentariosRepository.findOne({
      where: { id },
      relations: ['cliente', 'cliente.user'],
    });

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comentario.cliente.userId !== userId) {
      throw new UnauthorizedException(
        'No se puede actualizar un comentario que no es suyo',
      );
    }

    Object.assign(comentario, updateComentarioDto);

    return this.comentariosRepository.save(comentario);
  }

  /**
   * Elimina un comentario por su ID.
   * @param id - ID del comentario a eliminar.
   * @returns El comentario eliminado.
   * @throws NotFoundException si el comentario no existe.
   */
  async remove(id: number): Promise<Comentario> {
    const comentario = await this.comentariosRepository.findOneBy({ id });

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return this.comentariosRepository.remove(comentario);
  }
}
