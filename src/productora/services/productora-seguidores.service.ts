import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { Repository } from 'typeorm';
import { Productora } from '../entities/productora.entity';

@Injectable()
export class ProductoraSeguidoresService {
  constructor(
    @InjectRepository(Productora)
    private readonly productoraRepository: Repository<Productora>,
    private readonly clientesService: ClientesService,
  ) {}

  /**
   * Retrieves the followers (clientes) of a specific productora.
   * @param idProductora - The ID of the productora.
   * @returns An array of Cliente entities who follow the productora.
   * @throws NotFoundException if the productora does not exist.
   */
  async getSeguidores(idProductora: number) {
    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
      relations: ['seguidores', 'seguidores.user'],
    });
    if (!productora) {
      throw new NotFoundException('La productora no existe');
    }
    return productora.seguidores;
  }

  /**
   * Allows a cliente to follow a productora.
   * @param idCliente - The ID of the cliente who wants to follow the productora.
   * @param idProductora - The ID of the productora to be followed.
   * @returns void
   * @throws NotFoundException if the cliente or productora does not exist, or if the cliente already follows the productora.
   */
  async seguirProductora(
    idCliente: number,
    idProductora: number,
  ): Promise<void> {
    const cliente = await this.clientesService.findOneById(idCliente);
    if (!cliente) {
      throw new NotFoundException('El cliente no existe');
    }

    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
    });
    if (!productora) {
      throw new NotFoundException('La productora no existe');
    }

    // Verificar si ya existe la relación usando query builder
    const existingRelation = await this.productoraRepository
      .createQueryBuilder('productora')
      .innerJoin('productora.seguidores', 'cliente')
      .where('productora.userId = :productoraId', {
        productoraId: idProductora,
      })
      .andWhere('cliente.userId = :clienteId', { clienteId: idCliente })
      .getCount();

    if (existingRelation > 0) {
      throw new ConflictException('El cliente ya sigue a la productora');
    }

    // Insertar la relación directamente
    await this.productoraRepository
      .createQueryBuilder()
      .relation('seguidores')
      .of(productora.userId)
      .add(cliente.userId);
  }

  /**
   * Allows a cliente to unfollow a productora.
   * @param idCliente - The ID of the cliente who wants to unfollow the productora.
   * @param idProductora - The ID of the productora to be unfollowed.
   * @returns void
   * @throws NotFoundException if the cliente or productora does not exist.
   * @throws BadRequestException if the cliente does not follow the productora.
   */
  async dejarDeSeguirProductora(
    idCliente: number,
    idProductora: number,
  ): Promise<void> {
    const cliente = await this.clientesService.findOneById(idCliente);
    if (!cliente) {
      throw new NotFoundException('El cliente no existe');
    }

    const productora = await this.productoraRepository.findOne({
      where: { userId: idProductora },
    });
    if (!productora) {
      throw new NotFoundException('La productora no existe');
    }

    // Verificar si existe la relación usando query builder
    const existingRelation = await this.productoraRepository
      .createQueryBuilder('productora')
      .innerJoin('productora.seguidores', 'cliente')
      .where('productora.userId = :productoraId', {
        productoraId: idProductora,
      })
      .andWhere('cliente.userId = :clienteId', { clienteId: idCliente })
      .getCount();

    if (existingRelation === 0) {
      throw new BadRequestException('El cliente no sigue a la productora');
    }

    // Eliminar la relación directamente
    await this.productoraRepository
      .createQueryBuilder()
      .relation('seguidores')
      .of(productora.userId)
      .remove(cliente.userId);
  }
}
