import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientesService } from 'src/clientes/clientes.service';
import { ProductoraService } from 'src/productora/services/productora.service';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthLoginService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly productoraService: ProductoraService,
    private readonly clientesService: ClientesService,
  ) {}

  /**
   * Validates a user by their email and password.
   * Returns the user if valid, otherwise null.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns The validated user or null.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) return null;

    const isPasswordValid = await user.checkPassword(password);

    return isPasswordValid ? user : null;
  }

  /**
   * Generates a JWT for the given productora user after verifying their profile exists.
   * @param user - The productora user to generate a JWT for.
   * @returns An object containing the access token.
   * @throws UnauthorizedException if the productora profile does not exist.
   */
  async loginProductora(user: User) {
    const productora = await this.productoraService.getProfile(user.id);
    if (!productora) {
      throw new UnauthorizedException('Productora profile not found');
    }
    return this.authService.generateAccessToken(user);
  }

  /**
   * Generates a JWT for the given cliente user after verifying their profile exists.
   * @param user - The cliente user to generate a JWT for.
   * @returns An object containing the access token.
   * @throws UnauthorizedException if the cliente profile does not exist.
   */
  async loginCliente(user: User) {
    const cliente = await this.clientesService.getProfile(user.id);
    if (!cliente) {
      throw new UnauthorizedException('Cliente profile not found');
    }
    return this.authService.generateAccessToken(user);
  }
}
