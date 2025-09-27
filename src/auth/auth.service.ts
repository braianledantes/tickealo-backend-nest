import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileUploadService } from 'src/files/file-upload.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterProductoraDto } from './dtos/register-productora.dto';
import { RegisterClienteDto } from './dtos/register-cliente.dto';
import { RegisterValidadorDto } from './dtos/register-validador.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly fileUploadService: FileUploadService,
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
    const productora = await this.usersService.createProductora(
      userData,
      productoraData,
    );

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
    const cliente = await this.usersService.createCliente(
      userData,
      clienteData,
    );

    if (!cliente) {
      throw new InternalServerErrorException('Error creating cliente');
    }

    // Generar token de acceso para el cliente recién registrado
    return await this.generateAccessToken(cliente.user);
  }

  async registerValidador(
    registerValidadorDto: RegisterValidadorDto,
    imageFile?: Express.Multer.File,
  ) {
    const { username, email, password } = registerValidadorDto;

    // Datos del usuario base
    const userData = {
      username,
      email,
      password,
    };

    // Datos específicos del validador
    const validadorData: {
      nombre: string;
      imagenPerfilUrl?: string;
    } = {
      nombre: registerValidadorDto.nombre,
    };

    // Si hay una imagen, guardarla y agregar la URL
    if (imageFile) {
      const imageUrl = await this.fileUploadService.saveImage(imageFile);
      validadorData.imagenPerfilUrl = imageUrl;
    }

    // Crear el validador con su usuario
    const validador = await this.usersService.createValidador(
      userData,
      validadorData,
    );

    if (!validador) {
      throw new InternalServerErrorException('Error creating validador');
    }

    // Generar token de acceso para el validador recién registrado
    return await this.generateAccessToken(validador.user);
  }
}
