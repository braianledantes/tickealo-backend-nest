import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientesService } from '../../clientes/clientes.service';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../../users/users.service';
import { GoogleUser } from '../interfaces/google.user.interface';

@Injectable()
export class AuthGoogleService {
  private readonly googleCliente: OAuth2Client;
  private readonly clientId: string;

  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly clientesService: ClientesService,
  ) {
    this.clientId = configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.googleCliente = new OAuth2Client(this.clientId);
  }

  async validateOAuthLogin(googleUser: GoogleUser) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      const userData = {
        username: googleUser.email,
        email: googleUser.email,
        password: '',
      };
      const clienteData = {
        nombre: googleUser.firstName,
        apellido: googleUser.lastName,
        telefono: '',
      };
      const cliente = await this.clientesService.createCliente(
        userData,
        clienteData,
      );
      user = cliente.user;
    }

    return this.authService.generateAccessToken(user);
  }

  async validateGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleCliente.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();

      const googleUser = {
        firstName: payload?.given_name,
        lastName: payload?.family_name,
        email: payload?.email,
        picture: payload?.picture,
      } as GoogleUser;

      return this.validateOAuthLogin(googleUser);
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
