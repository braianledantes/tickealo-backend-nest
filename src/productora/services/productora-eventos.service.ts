import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Productora } from '../entities/productora.entity';

@Injectable()
export class ProductoraEventosService {
  constructor(
    @InjectRepository(Productora)
    private readonly productoraRepository: Repository<Productora>,
  ) {}

  /**
   * Retrieves a productora along with its associated events.
   * @param idProductora - The ID of the productora.
   * @returns The productora entity with its events.
   * @throws NotFoundException if the productora does not exist.
   */
  async getEventosProductora(idProductora: number) {
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: [
        'eventos',
        'eventos.lugar',
        'eventos.cuentaBancaria',
        'eventos.entradas',
      ],
    });
    if (!productora) {
      throw new NotFoundException('La productora no existe');
    }
    return productora.eventos;
  }
}
