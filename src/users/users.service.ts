import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Productora } from './entities/productora.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Validador } from './entities/validador.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Productora)
    private readonly productorasRepository: Repository<Productora>,
    @InjectRepository(Validador)
    private readonly validadoresRepository: Repository<Validador>,
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
  ) {}

  /**
   * Finds a user by their username.
   * @param username - The username of the user to find.
   * @returns The user if found, otherwise null.
   */
  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  /**
   * Finds a user by their email.
   * @param email - The email of the user to find.
   * @returns The user if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  /**
   * Marks a user's email as verified.
   * @param userId - The ID of the user to verify.
   */
  async markEmailAsVerified(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      emailVerifiedAt: new Date(),
    });
  }

  /**
   * Creates a user with the specified role.
   * If the role is 'cliente', only the cliente role is assigned.
   * For 'productora' and 'validador', both the specified role and the cliente role are assigned.
   * @param userData - Partial user data including username, email, and password.
   * @param roleName - The role to assign ('productora', 'validador', or 'cliente').
   * @returns The created user.
   * @throws BadRequestException if username or email already exists.
   * @throws UnprocessableEntityException if the specified role does not exist.
   */
  private async createUsetWithRole(
    userData: Partial<User>,
    roleName: 'productora' | 'validador' | 'cliente',
  ): Promise<User> {
    // Check if username or email already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });
    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    // Asign the role to the user
    const role = await this.rolesRepository.findOne({
      where: { name: roleName },
    });
    if (!role) {
      throw new UnprocessableEntityException('Role not found');
    }
    userData.roles = [role];

    // Create the user
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  /**
   * Creates a productora user and their associated productora profile.
   * @param userData - Partial user data including username, email, and password.
   * @param productoraData - Partial productora data including cuit, nombre, direccion, and telefono.
   * @returns The created productora profile.
   * @throws BadRequestException if username, email, or CUIT already exists.
   * @throws UnprocessableEntityException if the specified role does not exist.
   */
  async createProductora(
    userData: Partial<User>,
    productoraData: Partial<Productora>,
  ): Promise<Productora | null> {
    // Check that CUIT is unique
    const existingProductora = await this.productorasRepository.findOne({
      where: { cuit: productoraData.cuit },
    });
    if (existingProductora) {
      throw new BadRequestException('CUIT already exists');
    }

    // Create the user with the productora role
    const user = await this.createUsetWithRole(userData, 'productora');

    // Create the productora profile
    const productora = this.productorasRepository.create({
      ...productoraData,
      userId: user.id,
    });
    await this.productorasRepository.save(productora);
    return this.productorasRepository.findOneOrFail({
      where: { userId: user.id },
    });
  }

  /**
   * Creates a validador user and their associated validador profile.
   * @param userData - Partial user data including username, email, and password.
   * @param validadorData - Partial validador data including nombre, estado, and fechaAsignacion.
   * @returns The created validador profile.
   * @throws BadRequestException if username or email already exists.
   * @throws UnprocessableEntityException if the specified role does not exist.
   */
  async createValidador(
    userData: Partial<User>,
    validadorData: Partial<Validador>,
  ): Promise<Validador> {
    const user = await this.createUsetWithRole(userData, 'validador');

    // Create the validador profile
    const validador = this.validadoresRepository.create({
      ...validadorData,
      userId: user.id,
    });
    await this.validadoresRepository.save(validador);
    return this.validadoresRepository.findOneOrFail({
      where: { userId: user.id },
    });
  }

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
    const user = await this.createUsetWithRole(userData, 'cliente');

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

  /**
   * Finds a Productora, Validador, or Cliente profile by the associated user ID.
   * @param userId - The ID of the user.
   * @returns The associated profile (Productora, Validador, or Cliente) or null if none found.
   */
  findProductoraByUserId(userId: number): Promise<Productora | null> {
    return this.productorasRepository.findOneBy({ userId });
  }

  /**
   * Finds a Validador profile by the associated user ID.
   * @param userId - The ID of the user.
   * @returns The associated Validador profile or null if none found.
   */
  findValidadorByUserId(userId: number): Promise<Validador | null> {
    return this.validadoresRepository.findOneBy({ userId });
  }

  /**
   * Finds a Cliente profile by the associated user ID.
   * @param userId - The ID of the user.
   * @returns The associated Cliente profile or null if none found.
   */
  findClienteByUserId(userId: number): Promise<Cliente | null> {
    return this.clientesRepository.findOneBy({ userId });
  }
}
