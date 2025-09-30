import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientesService } from 'src/clientes/clientes.service';
import { FileUploadService } from 'src/files/file-upload.service';
import { MailService } from 'src/mail/mail.service';
import { ProductoraService } from 'src/productora/productora.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterClienteDto } from './dtos/register-cliente.dto';
import { RegisterProductoraDto } from './dtos/register-productora.dto';
import { EmailVerificationPayload } from './interfaces/email-verification-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly productoraService: ProductoraService,
    private readonly clientesService: ClientesService,
    private readonly jwtService: JwtService,
    private readonly fileUploadService: FileUploadService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Gets the profile of the authenticated user, whether they are a productora or cliente.
   * @param userId - The ID of the authenticated user.
   * @returns The profile of the user, either as a Productora or Cliente.
   * @throws NotFoundException if no profile is found for the user.
   */
  async getProfile(userId: number) {
    const productora = await this.productoraService.getProfile(userId);
    if (!productora) {
      const cliente = await this.clientesService.getProfile(userId);
      if (!cliente) {
        throw new NotFoundException('Profile not found');
      }
      return {
        userType: 'cliente',
        ...cliente,
      };
    }
    return {
      userType: 'productora',
      ...productora,
    };
  }

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
   * Generates a JWT for the given user.
   * @param user - The user to generate a JWT for.
   * @returns An object containing the access token.
   */
  async login(user: User) {
    return this.generateAccessToken(user);
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
    return this.generateAccessToken(user);
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

  /**
   * Generates a JWT token for email verification.
   * @param user - The user to generate a verification token for.
   * @returns A verification token.
   */
  private async generateEmailVerificationToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // Token expires in 24 hours
    return this.jwtService.signAsync(payload, { expiresIn: '24h' });
  }

  /**
   * Verifies an email verification token.
   * @param token - The JWT token to verify.
   * @returns The decoded payload if valid.
   */
  private async verifyEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationPayload> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token);

      if (!payload || typeof payload !== 'object') {
        throw new BadRequestException('Invalid token type');
      }

      return payload as EmailVerificationPayload;
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  /**
   * Sends an email verification to the user.
   * @param user - The user to send verification email to.
   */
  private async sendEmailVerification(user: User): Promise<void> {
    const verificationToken = await this.generateEmailVerificationToken(user);

    await this.mailService.sendEmailVerification(
      user.email,
      user.username,
      verificationToken,
    );
  }

  /**
   * Verifies a user's email using the verification token.
   * @param token - The JWT verification token.
   * @returns Success message.
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const payload = await this.verifyEmailVerificationToken(token);

    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      return { message: 'Email already verified' };
    }

    // Mark email as verified
    await this.usersService.markEmailAsVerified(user.id);

    return { message: 'Email verified successfully' };
  }

  async registerProductora(
    registerProductoraDto: RegisterProductoraDto,
    imageFile?: Express.Multer.File,
  ) {
    const { username, email, password, cuit, nombre, direccion, telefono } =
      registerProductoraDto;

    // Datos del usuario base
    const userData = {
      username,
      email,
      password,
    };

    // Datos específicos de la productora
    const productoraData: {
      cuit: string;
      nombre: string;
      direccion: string;
      telefono: string;
      imagenUrl?: string;
    } = {
      cuit,
      nombre,
      direccion,
      telefono,
    };

    // Si hay una imagen, guardarla y agregar la URL
    if (imageFile) {
      const imageUrl = await this.fileUploadService.saveImage(imageFile);
      productoraData.imagenUrl = imageUrl;
    }

    // Crear la productora con su usuario
    const productora = await this.productoraService.createProductora(
      userData,
      productoraData,
    );

    if (!productora) {
      throw new InternalServerErrorException('Failed to create productora');
    }

    // Enviar email de verificación
    await this.sendEmailVerification(productora.user);

    if (!productora) {
      throw new InternalServerErrorException('Error creating productora');
    }

    // Generar token de acceso para la productora recién registrada
    return await this.generateAccessToken(productora.user);
  }

  async registerCliente(
    registerClienteDto: RegisterClienteDto,
    imageFile?: Express.Multer.File,
  ) {
    const { username, email, password } = registerClienteDto;

    // Datos del usuario base
    const userData = {
      username,
      email,
      password,
    };

    // Datos específicos del cliente
    const clienteData: {
      nombre: string;
      apellido: string;
      telefono: string;
      imagenPerfilUrl?: string;
    } = {
      nombre: registerClienteDto.nombre,
      apellido: registerClienteDto.apellido,
      telefono: registerClienteDto.telefono,
    };

    // Si hay una imagen, guardarla y agregar la URL
    if (imageFile) {
      const imageUrl = await this.fileUploadService.saveImage(imageFile);
      clienteData.imagenPerfilUrl = imageUrl;
    }

    // Crear el cliente con su usuario
    const cliente = await this.clientesService.createCliente(
      userData,
      clienteData,
    );

    if (!cliente) {
      throw new InternalServerErrorException('Failed to create cliente');
    }

    // Enviar email de verificación
    await this.sendEmailVerification(cliente.user);

    if (!cliente) {
      throw new InternalServerErrorException('Error creating cliente');
    }

    // Generar token de acceso para el cliente recién registrado
    return await this.generateAccessToken(cliente.user);
  }
}
