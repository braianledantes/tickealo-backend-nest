import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientesService } from 'src/clientes/clientes.service';
import { FileUploadService } from 'src/files/file-upload.service';
import { ProductoraService } from 'src/productora/services/productora.service';
import { UpdateClienteDto } from '../dtos/update-cliente.dto';
import { UpdateProductoraDto } from '../dtos/update-productora.dto';

@Injectable()
export class AuthProfileService {
  constructor(
    private readonly productoraService: ProductoraService,
    private readonly clientesService: ClientesService,
    private readonly fileUploadService: FileUploadService,
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
      return cliente;
    }
    return productora;
  }

  /**
   * Updates the productora profile for the given user ID.
   * @param id - The ID of the user whose productora profile is to be updated.
   * @param updateProductoraDto - The data to update the productora profile with.
   * @returns The updated productora profile.
   * @throws BadRequestException if the productora does not exist.
   */
  async updateProductora(
    id: number,
    updateProductoraDto: UpdateProductoraDto,
    imageFile?: Express.Multer.File,
  ) {
    const { username, email, password, cuit, nombre, direccion, telefono } =
      updateProductoraDto;

    const userData: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    // Preparar datos específicos de la productora
    const productoraData: {
      cuit?: string;
      nombre?: string;
      direccion?: string;
      telefono?: string;
      imagenUrl?: string;
    } = {};

    // Solo agregar campos que están definidos en el DTO
    if (username !== undefined) userData.username = username;
    if (email !== undefined) userData.email = email;
    if (password !== undefined) userData.password = password;

    if (cuit !== undefined) productoraData.cuit = cuit;
    if (nombre !== undefined) productoraData.nombre = nombre;
    if (direccion !== undefined) productoraData.direccion = direccion;
    if (telefono !== undefined) productoraData.telefono = telefono;

    // Si hay una imagen, guardarla y agregar la URL
    if (imageFile) {
      const imageUrl = await this.fileUploadService.saveImage(imageFile);
      productoraData.imagenUrl = imageUrl;
    }

    // Actualizar la productora usando el servicio
    const updatedProductora = await this.productoraService.updateProductora(
      id,
      userData,
      productoraData,
    );

    return updatedProductora;
  }

  async updateCliente(
    id: number,
    updateClienteDto: UpdateClienteDto,
    imageFile?: Express.Multer.File,
  ) {
    const { username, email, password, nombre, apellido, telefono } =
      updateClienteDto;

    const userData: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    // Preparar datos específicos del cliente
    const clienteData: {
      nombre?: string;
      apellido?: string;
      telefono?: string;
      imagenPerfilUrl?: string;
    } = {};

    // Solo agregar campos que están definidos en el DTO
    if (username !== undefined) userData.username = username;
    if (email !== undefined) userData.email = email;
    if (password !== undefined) userData.password = password;

    if (nombre !== undefined) clienteData.nombre = nombre;
    if (apellido !== undefined) clienteData.apellido = apellido;
    if (telefono !== undefined) clienteData.telefono = telefono;

    // Si hay una imagen, guardarla y agregar la URL
    if (imageFile) {
      const imageUrl = await this.fileUploadService.saveImage(imageFile);
      clienteData.imagenPerfilUrl = imageUrl;
    }

    // Actualizar el cliente usando el servicio
    const updatedCliente = await this.clientesService.updateCliente(
      id,
      userData,
      clienteData,
    );

    return updatedCliente;
  }
}
