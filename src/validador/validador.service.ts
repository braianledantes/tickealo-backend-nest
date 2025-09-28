import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Validador } from './entities/validador.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ValidadorService {
  constructor(
    @InjectRepository(Validador)
    private readonly validadoresRepository: Repository<Validador>,
    private readonly usersService: UsersService,
  ) {}

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
    const user = await this.usersService.createUserWithRole(
      userData,
      'validador',
    );

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
   * Finds a validador by the associated user email.
   * @param email - The email of the user associated with the validador.
   * @returns The validador entity if found, otherwise throws NotFoundException.
   * @throws NotFoundException if no validador is found for the given email.
   */
  async findOneByEmail(email: string) {
    const validador = await this.validadoresRepository.findOne({
      where: { user: { email } },
    });
    if (!validador) {
      throw new NotFoundException('Validador no encontrado');
    }
    return validador;
  }
}
