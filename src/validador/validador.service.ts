import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { Repository } from 'typeorm';
import { Validador } from './entities/validador.entity';
import { Productora } from 'src/productora/entities/productora.entity';
import { Evento } from 'src/eventos/entities/evento.entity';

@Injectable()
export class ValidadorService {
  constructor(
    @InjectRepository(Validador)
    private readonly validadoresRepository: Repository<Validador>,
    private readonly clientesService: ClientesService,
  ) {}

  /**
   * Creates a validador associated with the user identified by the given email.
   * @param email - The email of the user to associate with the new validador.
   * @returns The created validador entity.
   * @throws NotFoundException if no user is found with the given email.
   */
  async createValidador(email: string): Promise<Validador> {
    const cliente = await this.clientesService.findOneByEmail(email);
    if (!cliente) {
      throw new NotFoundException('Cliente not found');
    }

    const validador = this.validadoresRepository.create({
      userId: cliente.userId,
    });
    await this.validadoresRepository.save(validador);
    return this.validadoresRepository.findOneOrFail({
      where: { userId: cliente.userId },
      relations: ['cliente', 'cliente.user'],
    });
  }

  /**
   * Finds a validador by the associated user email.
   * @param email - The email of the user associated with the validador.
   * @returns The validador entity if found, otherwise throws NotFoundException.
   * @throws NotFoundException if no validador is found for the given email.
   */
  async findOneByEmail(email: string) {
    return await this.validadoresRepository.findOne({
      where: { cliente: { user: { email } } },
      relations: ['cliente', 'cliente.user'],
    });
  }

  /**
   * Retrieves all events associated with the productoras linked to the validador identified by the given userId.
   * @param userId - The userId of the validador.
   * @returns An array of events associated with the validador's productoras.
   * @throws NotFoundException if no validador is found with the given userId.
   */
  async getEventosDelValidador(userId: number): Promise<Evento[]> {
    const validador = await this.validadoresRepository.findOne({
      where: { userId },
      relations: [
        'productoras',
        'productoras.eventos',
        'productoras.eventos.productora',
      ],
      order: { productoras: { eventos: { inicioAt: 'ASC' } } },
    });

    if (!validador) {
      throw new NotFoundException('Validador no encontrado');
    }

    const eventos = validador.productoras.flatMap(
      (productora) => productora.eventos,
    );

    return eventos;
  }

  /**
   * Retrieves all productoras associated with the validador identified by the given userId.
   * @param userId - The userId of the validador.
   * @returns An array of productoras associated with the validador.
   * @throws NotFoundException if no validador is found with the given userId.
   */
  async getProductorasDelValidador(userId: number): Promise<Productora[]> {
    const validador = await this.validadoresRepository.findOne({
      where: { userId },
      relations: ['productoras'],
      order: { productoras: { nombre: 'ASC' } },
    });

    if (!validador) {
      throw new NotFoundException('Validador no encontrado');
    }

    return validador.productoras;
  }
}
