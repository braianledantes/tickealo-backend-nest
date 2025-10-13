import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Compra } from '../entities/compra.entity';
import { EstadoCompra } from '../enums/estado-compra.enum';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,
  ) {}

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
        {
          id: compraId,
          cliente: { userId },
          estado: Not(EstadoCompra.INICIADA),
        },
        {
          id: compraId,
          tickets: {
            entrada: { evento: { productora: { userId } } },
          },
          estado: Not(EstadoCompra.INICIADA),
        },
      ],
      relations: [
        'cliente',
        'tickets',
        'tickets.entrada',
        'tickets.entrada.evento',
      ],
    });

    if (!compra) {
      throw new BadRequestException('La compra no existe o no tienes acceso.');
    }
    return compra;
  }
}
