import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Productora } from '../entities/productora.entity';

@Injectable()
export class ProductoraService {
  constructor(
    @InjectRepository(Productora)
    private readonly productoraRepository: Repository<Productora>,
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
      relations: ['user', 'user.roles'],
    });
  }

  /**
   * Updates the productora profile for the authenticated user.
   * @param userId - The ID of the authenticated user.
   * @param updateData - Partial productora data to update.
   * @returns The updated productora profile.
   * @throws NotFoundException if the productora does not exist.
   * @throws ConflictException if the new CUIT already exists.
   * @throws InternalServerErrorException if there is an error updating the productora.
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
      throw new NotFoundException('La productora no existe');
    }

    // If CUIT is being updated, check for uniqueness
    if (updateData.cuit && updateData.cuit !== productora.cuit) {
      const existingProductora = await this.productoraRepository.findOne({
        where: { cuit: updateData.cuit },
      });
      if (existingProductora) {
        throw new ConflictException('CUIT already exists');
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
      relations: ['cuentaBancaria', 'user', 'user.roles'],
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
}
