import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user by their username and password.
   * Returns the user if valid, otherwise null.
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns The validated user or null.
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(username);

    if (!user) return null;

    const isPasswordValid = await user.checkPassword(password);

    return isPasswordValid ? user : null;
  }

  /**
   * Generates a JWT for the given user.
   * @param user - The user to generate a JWT for.
   * @returns An object containing the access token.
   */
  async login(user: User) {
    return this.generateAccessToken(user);
  }

  private async generateAccessToken(user: User) {
    const { id, username, roles } = user;
    const payload = {
      sub: id,
      username,
      roles: roles.map((role) => role.name),
    };

    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
    };
  }
}
