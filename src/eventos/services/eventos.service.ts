import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from '../entities/evento.entity';
import { CalificacionesEventoDto } from '../dto/calificaciones-evento.dto';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
  ) {}

  /**
   * Finds an evento by its ID.
   * @param id - ID of the evento.
   * @returns Promise<Evento | null>
   */
  findOneById(id: number): Promise<Evento | null> {
    return this.eventoRepository.findOne({ where: { id } });
  }

  /**
   * Obtiene las calificaciones de un evento específico.
   * @param eventoId ID del evento.
   * @returns Objeto con las calificaciones del evento.
   * @throws NotFoundException si el evento no existe.
   */
  async getCalificaciones(eventoId: number): Promise<CalificacionesEventoDto> {
    const evento = await this.eventoRepository.findOne({
      where: { id: eventoId },
      relations: ['comentarios'],
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    const calificaciones = evento.comentarios.map((c) => c.calificacion);

    const total = calificaciones.length;
    const promedio =
      total > 0
        ? calificaciones.reduce((sum, rating) => sum + rating, 0) / total
        : 0;

    const cantUno = calificaciones.filter((c) => c === 1).length;
    const cantDos = calificaciones.filter((c) => c === 2).length;
    const cantTres = calificaciones.filter((c) => c === 3).length;
    const cantCuatro = calificaciones.filter((c) => c === 4).length;
    const cantCinco = calificaciones.filter((c) => c === 5).length;

    return {
      promedio,
      total,
      cantUno,
      cantDos,
      cantTres,
      cantCuatro,
      cantCinco,
    };
  }
}
