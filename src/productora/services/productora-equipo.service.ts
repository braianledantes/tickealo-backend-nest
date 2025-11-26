import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/enums/role.enum';
import { UsersService } from 'src/users/users.service';
import { ValidadorService } from 'src/validador/validador.service';
import { Repository } from 'typeorm';
import { Productora } from '../entities/productora.entity';

@Injectable()
export class ProductoraEquipoService {
  constructor(
    @InjectRepository(Productora)
    private readonly productoraRepository: Repository<Productora>,
    private readonly validadorService: ValidadorService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Retrieves the team members (validadores) of a specific productora.
   * @param idProductora - The ID of the productora.
   * @returns An array of Validador entities associated with the productora.
   * @throws NotFoundException if the productora does not exist.
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
      throw new NotFoundException('La productora no existe');
    }
    return productora.validadores;
  }

  /**
   * Adds a member to the productora's team.
   * @param idProductora - The ID of the productora.
   * @param userEmail - The email of the validador to be added.
   * @returns The updated productora entity.
   * @throws NotFoundException if the productora does not exist.
   * @throws ConflictException if the validador is already a team member.
   */
  async addMiembroEquipo(idProductora: number, userEmail: string) {
    // Buscar la productora por su ID
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['validadores'],
    });
    if (!productora) {
      throw new NotFoundException('La productora no existe');
    }

    // Crear o buscar el validador por su email
    const validador = await this.validadorService.createValidador(userEmail);
    // Asignar el rol de validador al usuario
    await this.usersService.asignarRolUsuario(validador.userId, Role.Validador);

    // Verificar si el validador ya es miembro del equipo
    const isMember = productora.validadores.some(
      (miembro) => miembro.userId === validador.userId,
    );
    if (isMember) {
      throw new ConflictException('El validador ya es miembro del equipo');
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
   * @throws NotFoundException if the productora does not exist or if the validador is not a team member.
   */
  async removeMiembroEquipo(idProductora: number, userEmail: string) {
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['validadores'],
    });
    if (!productora) {
      throw new NotFoundException('La productora no existe');
    }
    const validador = await this.validadorService.findOneByEmail(userEmail);

    if (!validador) {
      throw new NotFoundException('El validador no existe');
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

    // Si el validador no pertenece a ninguna otra productora, removerle el rol de validador
    const otrasProductoras = await this.productoraRepository
      .createQueryBuilder('productora')
      .leftJoinAndSelect('productora.validadores', 'validador')
      .where('validador.userId = :validadorId', {
        validadorId: validador.userId,
      })
      .andWhere('productora.userId != :currentProductoraId', {
        currentProductoraId: idProductora,
      })
      .getMany();

    if (otrasProductoras.length === 0) {
      await this.usersService.removerRolUsuario(
        validador.userId,
        Role.Validador,
      );
    }

    return this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['user'],
    });
  }
}
