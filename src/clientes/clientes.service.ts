import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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

  async updateCliente(
    userId: number,
    clienteData: Partial<Cliente>,
  ): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOne({
      where: { userId },
    });
    if (!cliente) {
      throw new BadRequestException('Cliente not found');
    }
    Object.assign(cliente, clienteData);
    await this.clientesRepository.save(cliente);
    const clienteSaved = await this.clientesRepository.findOne({
      where: { userId },
    });
    if (!clienteSaved) {
      throw new InternalServerErrorException('Error updating cliente');
    }
    return clienteSaved;
  }

  /**
   * Gets the profile of the authenticated cliente.
   * @param userId - The ID of the authenticated user.
   * @returns The profile of the cliente or null if not found.
   */
  async getProfile(userId: number): Promise<Cliente | null> {
    return this.clientesRepository.findOne({
      where: { userId },
    });
  }

  /**
   * Finds a cliente by the associated user email.
   * @param email - The email of the user associated with the cliente.
   * @returns The cliente entity if found, otherwise throws NotFoundException.
   * @throws NotFoundException if no cliente is found for the given email.
   */
  async findOneByEmail(email: string) {
    return await this.clientesRepository.findOne({
      where: { user: { email } },
    });
  }

  /**
   * Finds a cliente by their user ID.
   * @param id - The user ID of the cliente.
   * @returns The cliente entity if found, otherwise throws NotFoundException.
   * @throws NotFoundException if no cliente is found for the given ID.
   */
  async findOneById(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOne({
      where: { userId: id },
    });
    if (!cliente) {
      throw new BadRequestException('Cliente not found');
    }
    return cliente;
  }
}
