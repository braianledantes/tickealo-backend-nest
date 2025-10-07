import {
  BadRequestException,
  ConflictException,
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
    return this.usersRepository.findOne({
      where: { username },
      relations: ['roles'],
    });
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
   * @throws ConflictException if username or email already exists.
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
      throw new ConflictException('Username or email already exists');
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

  async asignarRolUsuario(userId: number, roleName: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const role = await this.rolesRepository.findOne({
      where: { name: roleName },
    });
    if (!role) {
      throw new UnprocessableEntityException('Role not found');
    }

    // Check if the user already has the role
    if (user.roles.some((r) => r.name === roleName)) {
      return user; // Role already assigned, return the user as is
    }

    user.roles.push(role);
    return this.usersRepository.save(user);
  }

  /**
   * Updates a user's information.
   * @param userId - The ID of the user to update.
   * @param userData - Partial user data to update.
   * @returns The updated user.
   * @throws BadRequestException if the user is not found.
   * @throws ConflictException if the new username already exists.
   * @throws BadRequestException if the new email already exists.
   * @throws UnprocessableEntityException if there is an error updating the user.
   */
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    // Check if username or email already exists
    if (userData.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: userData.username },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username already exists');
      }
    }
    if (userData.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if the user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update the user
    Object.assign(user, userData);
    await this.usersRepository.save(user);
    const userSaved = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    // Verify the user was updated
    if (!userSaved) {
      throw new UnprocessableEntityException('Error updating user');
    }
    return userSaved;
  }
}
