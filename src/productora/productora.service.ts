import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidadorService } from 'src/validador/validador.service';
import { Repository } from 'typeorm';
import { Productora } from './entities/productora.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/auth/enums/role.enum';
import { ClientesService } from 'src/clientes/clientes.service';

@Injectable()
export class ProductoraService {
  constructor(
    @InjectRepository(Productora)
    private readonly productoraRepository: Repository<Productora>,
    private readonly validadorService: ValidadorService,
    private readonly clientesService: ClientesService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a productora user and their associated productora profile.
   * @param userData - Partial user data including username, email, and password.
   * @param productoraData - Partial productora data including cuit, nombre, direccion, and telefono.
   * @returns The created productora profile.
   * @throws ConflictException if username, email, or CUIT already exists.
   * @throws UnprocessableEntityException if the specified role does not exist.
   */
  async createProductora(
    userData: Partial<User>,
    productoraData: Partial<Productora>,
  ): Promise<Productora | null> {
    // Check that CUIT is unique
    const existingProductora = await this.productoraRepository.findOne({
      where: { cuit: productoraData.cuit },
    });
    if (existingProductora) {
      throw new ConflictException('CUIT already exists');
    }

    // Create the user with the productora role
    const user = await this.usersService.createUserWithRole(
      userData,
      'productora',
    );

    // Create the productora profile
    const productora = this.productoraRepository.create({
      ...productoraData,
      userId: user.id,
    });
    await this.productoraRepository.save(productora);
    return this.productoraRepository.findOneOrFail({
      where: { userId: user.id },
      relations: ['user'],
    });
  }

  /**
   * Updates the productora profile for the authenticated user.
   * @param userId - The ID of the authenticated user.
   * @param updateData - Partial productora data to update.
   * @returns The updated productora profile.
   * @throws BadRequestException if the productora does not exist or if CUIT already exists.
   */
  async updateProductora(
    userId: number,
    userData: Partial<User>,
    updateData: Partial<Productora>,
  ): Promise<Productora> {
    // First, update the user data
    await this.usersService.updateUser(userId, userData);

    const productora = await this.productoraRepository.findOne({
      where: { userId },
    });
    if (!productora) {
      throw new BadRequestException('La productora no existe');
    }

    // If CUIT is being updated, check for uniqueness
    if (updateData.cuit && updateData.cuit !== productora.cuit) {
      const existingProductora = await this.productoraRepository.findOne({
        where: { cuit: updateData.cuit },
      });
      if (existingProductora) {
        throw new BadRequestException('CUIT already exists');
      }
    }

    Object.assign(productora, updateData);
    await this.productoraRepository.save(productora);
    const productoraSaved = await this.productoraRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!productoraSaved) {
      throw new InternalServerErrorException(
        'Error al actualizar la productora',
      );
    }
    return productoraSaved;
  }

  /**
   * Gets the profile of the authenticated productora.
   * @param userId - The ID of the authenticated user.
   * @returns The profile of the productora or null if not found.
   */
  async getProfile(userId: number): Promise<Productora | null> {
    return this.productoraRepository.findOne({
      where: { userId },
      relations: ['cuentaBancaria', 'user'],
    });
  }

  /**
   * Finds a productora by the associated user ID.
   * @param userId - The ID of the user associated with the productora.
   * @returns The productora entity if found, otherwise null.
   */
  async findOneByUserId(userId: number) {
    return this.productoraRepository.findOne({
      where: { userId },
      relations: ['validadores', 'cuentaBancaria', 'eventos', 'user'],
    });
  }

  /**
   * Retrieves a productora along with its associated events.
   * @param idProductora - The ID of the productora.
   * @returns The productora entity with its events.
   * @throws BadRequestException if the productora does not exist.
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
      throw new BadRequestException('La productora no existe');
    }
    return productora.eventos;
  }

  /**
   * Retrieves the team members (validadores) of a specific productora.
   * @param idProductora - The ID of the productora.
   * @returns An array of Validador entities associated with the productora.
   * @throws BadRequestException if the productora does not exist.
   */
  async getEquipo(idProductora: number) {
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: [
        'validadores',
        'validadores.cliente',
        'validadores.cliente.user',
      ],
    });
    if (!productora) {
      throw new BadRequestException('La productora no existe');
    }
    return productora.validadores;
  }

  /**
   * Adds a member to the productora's team.
   * @param idProductora - The ID of the productora.
   * @param userEmail - The email of the validador to be added.
   * @returns The updated productora entity.
   * @throws BadRequestException if the productora does not exist or if the validador is already a team member.
   */
  async addMiembroEquipo(idProductora: number, userEmail: string) {
    // Buscar la productora por su ID
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['validadores'],
    });
    if (!productora) {
      throw new BadRequestException('La productora no existe');
    }

    // Buscar el validador por su email y si no existe, crearlo
    let validador = await this.validadorService.findOneByEmail(userEmail);
    // Si el validador no existe, crear uno nuevo
    if (!validador) {
      validador = await this.validadorService.createValidador(userEmail);
      // Asignar el rol de validador al usuario
      await this.usersService.asignarRolUsuario(
        validador.userId,
        Role.Validador,
      );
    }

    // Verificar si el validador ya es miembro del equipo
    const isMember = productora.validadores.some(
      (miembro) => miembro.userId === validador.userId,
    );
    if (isMember) {
      throw new BadRequestException('El validador ya es miembro del equipo');
    }
    productora.validadores.push(validador);
    await this.productoraRepository.save(productora);
    return this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['user'],
    });
  }

  /**
   * Removes a member from the productora's team.
   * @param idProductora - The ID of the productora.
   * @param userEmail - The email of the validador to be removed.
   * @returns The updated productora entity.
   * @throws BadRequestException if the productora does not exist or if the validador is not a team member.
   */
  async removeMiembroEquipo(idProductora: number, userEmail: string) {
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['validadores'],
    });
    if (!productora) {
      throw new BadRequestException('La productora no existe');
    }
    const validador = await this.validadorService.findOneByEmail(userEmail);

    if (!validador) {
      throw new BadRequestException('El validador no existe');
    }

    // Verificar si el validador es miembro del equipo
    const isMember = productora.validadores.some(
      (miembro) => miembro.userId === validador.userId,
    );
    if (!isMember) {
      throw new BadRequestException('El validador no es miembro del equipo');
    }
    productora.validadores = productora.validadores.filter(
      (v) => v.userId !== validador.userId,
    );
    await this.productoraRepository.save(productora);
    return this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['user'],
    });
  }

  /**
   * Retrieves the followers (clientes) of a specific productora.
   * @param idProductora - The ID of the productora.
   * @returns An array of Cliente entities who follow the productora.
   * @throws BadRequestException if the productora does not exist.
   */
  async getSeguidores(idProductora: number) {
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['seguidores', 'seguidores.user'],
    });
    if (!productora) {
      throw new BadRequestException('La productora no existe');
    }
    return productora.seguidores;
  }

  /**
   * Allows a cliente to follow a productora.
   * @param idCliente - The ID of the cliente who wants to follow the productora.
   * @param idProductora - The ID of the productora to be followed.
   * @returns void
   * @throws BadRequestException if the cliente or productora does not exist, or if the cliente already follows the productora.
   */
  async seguirProductora(
    idCliente: number,
    idProductora: number,
  ): Promise<void> {
    const cliente = await this.clientesService.findOneById(idCliente);
    if (!cliente) {
      throw new BadRequestException('El cliente no existe');
    }

    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
    });
    if (!productora) {
      throw new BadRequestException('La productora no existe');
    }

    // Verificar si ya existe la relación usando query builder
    const existingRelation = await this.productoraRepository
      .createQueryBuilder('productora')
      .innerJoin('productora.seguidores', 'cliente')
      .where('productora.userId = :productoraId', {
        productoraId: idProductora,
      })
      .andWhere('cliente.userId = :clienteId', { clienteId: idCliente })
      .getCount();

    if (existingRelation > 0) {
      throw new ConflictException('El cliente ya sigue a la productora');
    }

    // Insertar la relación directamente
    await this.productoraRepository
      .createQueryBuilder()
      .relation('seguidores')
      .of(productora.userId)
      .add(cliente.userId);
  }

  /**
   * Allows a cliente to unfollow a productora.
   * @param idCliente - The ID of the cliente who wants to unfollow the productora.
   * @param idProductora - The ID of the productora to be unfollowed.
   * @returns void
   * @throws BadRequestException if the cliente or productora does not exist, or if the cliente does not follow the productora.
   */
  async dejarDeSeguirProductora(
    idCliente: number,
    idProductora: number,
  ): Promise<void> {
    const cliente = await this.clientesService.findOneById(idCliente);
    if (!cliente) {
      throw new BadRequestException('El cliente no existe');
    }

    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
    });
    if (!productora) {
      throw new BadRequestException('La productora no existe');
    }

    // Verificar si existe la relación usando query builder
    const existingRelation = await this.productoraRepository
      .createQueryBuilder('productora')
      .innerJoin('productora.seguidores', 'cliente')
      .where('productora.userId = :productoraId', {
        productoraId: idProductora,
      })
      .andWhere('cliente.userId = :clienteId', { clienteId: idCliente })
      .getCount();

    if (existingRelation === 0) {
      throw new BadRequestException('El cliente no sigue a la productora');
    }

    // Eliminar la relación directamente
    await this.productoraRepository
      .createQueryBuilder()
      .relation('seguidores')
      .of(productora.userId)
      .remove(cliente.userId);
  }
}
