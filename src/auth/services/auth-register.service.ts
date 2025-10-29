import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientesService } from 'src/clientes/clientes.service';
import { FileUploadService } from 'src/files/file-upload.service';
import { ProductoraService } from 'src/productora/services/productora.service';
import { RegisterClienteDto } from '../dtos/register-cliente.dto';
import { RegisterProductoraDto } from '../dtos/register-productora.dto';
import { AuthService } from './auth.service';
import { AuthEmailService } from './auth-email.service';

@Injectable()
export class AuthRegisterService {
  constructor(
    private readonly authService: AuthService,
    private readonly authEmailService: AuthEmailService,
    private readonly productoraService: ProductoraService,
    private readonly clientesService: ClientesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async registerProductora(
    registerProductoraDto: RegisterProductoraDto,
    imageFile?: Express.Multer.File,
  ) {
    const {
      username,
      email,
      password,
      cuit,
      nombre,
      direccion,
      telefono,
      pais,
    } = registerProductoraDto;

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
      pais: string;
    } = {
      cuit,
      nombre,
      direccion,
      telefono,
      pais,
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
    await this.authEmailService.sendEmailVerification(productora.user);

    if (!productora) {
      throw new InternalServerErrorException('Error creating productora');
    }

    // Generar token de acceso para la productora recién registrada
    return await this.authService.generateAccessToken(productora.user);
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
      pais: string;
    } = {
      nombre: registerClienteDto.nombre,
      apellido: registerClienteDto.apellido,
      telefono: registerClienteDto.telefono,
      pais: registerClienteDto.pais,
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
    await this.authEmailService.sendEmailVerification(cliente.user);

    if (!cliente) {
      throw new InternalServerErrorException('Error creating cliente');
    }

    // Generar token de acceso para el cliente recién registrado
    return await this.authService.generateAccessToken(cliente.user);
  }
}
