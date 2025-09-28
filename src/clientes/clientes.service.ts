import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a cliente user and their associated cliente profile.
   * @param userData - Partial user data including username, email, and password.
   * @param clienteData - Partial cliente data including nombre, apellido, and telefono.
   * @returns The created cliente profile.
   * @throws BadRequestException if username or email already exists.
   * @throws UnprocessableEntityException if the specified role does not exist.
   */
  async createCliente(
    userData: Partial<User>,
    clienteData: Partial<Cliente>,
  ): Promise<Cliente> {
    const user = await this.usersService.createUserWithRole(
      userData,
      'cliente',
    );

    // Create the cliente profile
    const cliente = this.clientesRepository.create({
      ...clienteData,
      userId: user.id,
    });
    await this.clientesRepository.save(cliente);
    return this.clientesRepository.findOneOrFail({
      where: { userId: user.id },
    });
  }
}
