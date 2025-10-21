import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from '../entities/evento.entity';

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
}
