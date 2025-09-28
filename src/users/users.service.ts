import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
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
  async createUserWithRole(
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
}
