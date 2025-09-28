import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidadorService } from 'src/validador/validador.service';
import { Repository } from 'typeorm';
import { Productora } from './entities/productora.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProductoraService {
  constructor(
    @InjectRepository(Productora)
    private readonly productoraRepository: Repository<Productora>,
    private readonly validadorService: ValidadorService,
    private readonly usersService: UsersService,
  ) {}

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
    const existingProductora = await this.productoraRepository.findOne({
      where: { cuit: productoraData.cuit },
    });
    if (existingProductora) {
      throw new BadRequestException('CUIT already exists');
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
      relations: ['validadores', 'cuentaBancaria', 'eventos'],
    });
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
      relations: ['validadores'],
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
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['validadores'],
    });
    if (!productora) {
      throw new BadRequestException('La productora no existe');
    }
    const validador = await this.validadorService.findOneByEmail(userEmail);

    // Verificar si el validador ya es miembro del equipo
    const isMember = productora.validadores.some(
      (miembro) => miembro.userId === validador.userId,
    );
    if (isMember) {
      throw new BadRequestException('El validador ya es miembro del equipo');
    }
    productora.validadores.push(validador);
    return await this.productoraRepository.save(productora);
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
    return await this.productoraRepository.save(productora);
  }
}
