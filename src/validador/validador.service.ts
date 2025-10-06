import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { Repository } from 'typeorm';
import { Validador } from './entities/validador.entity';

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
}
