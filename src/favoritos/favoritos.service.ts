import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Evento } from 'src/eventos/entities/evento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
  ) {}

  /**
   * Añade un evento a los favoritos de un cliente.
   * @param userId - ID del cliente.
   * @param eventoId - ID del evento a añadir.
   * @returns El evento añadido a favoritos.
   * @throws NotFoundException si el evento no existe.
   */
  async addEventoToFavorites(userId: number, eventoId: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id: eventoId },
      relations: ['clientesFavoritos'],
    });
    if (!evento) {
      throw new NotFoundException('Evento not found');
    }
    const alreadyFavorited = evento.clientesFavoritos.some(
      (cliente) => cliente.userId === userId,
    );

    if (!alreadyFavorited) {
      evento.clientesFavoritos.push({ userId } as Cliente);
      await this.eventoRepository.save(evento);
    }

    return { evento };
  }

  /**
   * Elimina un evento de los favoritos de un cliente.
   * @param userId - ID del cliente.
   * @param eventoId - ID del evento a eliminar.
   * @returns El evento eliminado de favoritos.
   * @throws NotFoundException si el evento no existe.
   */
  async removeEventoFromFavorites(userId: number, eventoId: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id: eventoId },
      relations: ['clientesFavoritos'],
    });

    if (!evento) {
      throw new NotFoundException('Evento not found');
    }

    evento.clientesFavoritos = evento.clientesFavoritos.filter(
      (cliente) => cliente.userId !== userId,
    );

    await this.eventoRepository.save(evento);

    return { evento };
  }

  /**
   * Obtiene los eventos favoritos de un cliente.
   * @param userId - ID del cliente.
   * @returns Lista de eventos favoritos del cliente.
   */
  async getFavoriteEventos(userId: number) {
    const [eventos, cantidad] = await this.eventoRepository.findAndCount({
      where: { clientesFavoritos: { userId } },
      relations: ['lugar', 'productora'],
      order: { inicioAt: 'ASC' },
    });

    return {
      cantidad,
      eventos,
    };
  }
}
