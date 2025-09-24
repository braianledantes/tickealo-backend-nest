import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLugarDto } from './dto/create-lugar.dto';
import { UpdateLugarDto } from './dto/update-lugar.dto';
import { Repository } from 'typeorm';
import { Lugar } from './entities/lugar.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LugaresService {
  constructor(
    @InjectRepository(Lugar)
    private readonly lugaresRepository: Repository<Lugar>,
  ) {}

  /**
   * Crea un nuevo lugar si no existe uno con las mismas coordenadas y dirección.
   * @param createLugareDto Datos del lugar a crear.
   * @returns El lugar creado.
   * @throws BadRequestException si ya existe un lugar con las mismas coordenadas y dirección.
   */
  async create(createLugareDto: CreateLugarDto) {
    const existingLugar = await this.lugaresRepository.findOne({
      where: {
        latitud: createLugareDto.latitud,
        longitud: createLugareDto.longitud,
        direccion: createLugareDto.direccion,
      },
    });

    if (existingLugar) {
      throw new BadRequestException(
        'El lugar con las mismas coordenadas y dirección ya existe.',
      );
    }

    const newLugar = this.lugaresRepository.create(createLugareDto);
    return this.lugaresRepository.save(newLugar);
  }

  /**
   * Obtiene todos los lugares.
   * @returns Una lista de todos los lugares.
   */
  findAll() {
    return this.lugaresRepository.find();
  }

  /**
   * Encuentra lugares cercanos a una ubicación dada dentro de un radio especificado.
   * @param latitud Latitud del punto central.
   * @param longitud Longitud del punto central.
   * @param radius Radio en kilómetros.
   * @returns Una lista de lugares dentro del radio especificado.
   */
  async findClosePlaces(latitud: number, longitud: number, radius: number) {
    const lugares = await this.lugaresRepository.find();

    const toRad = (value: number) => (value * Math.PI) / 180;

    const placesWithinRadius = lugares.filter((lugar) => {
      const R = 6371; // Radio de la Tierra en km
      const dLat = toRad(lugar.latitud - latitud);
      const dLon = toRad(lugar.longitud - longitud);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(latitud)) *
          Math.cos(toRad(lugar.latitud)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distancia en km

      return distance <= radius;
    });

    return placesWithinRadius;
  }

  /**
   * Encuentra un lugar por su ID.
   * @param id ID del lugar a buscar.
   * @returns El lugar encontrado.
   * @throws NotFoundException si no se encuentra el lugar con el ID proporcionado.
   */
  async findOne(id: number) {
    const lugar = await this.lugaresRepository.findOne({ where: { id } });
    if (!lugar) {
      throw new NotFoundException(`Lugar with ID ${id} not found.`);
    }
    return lugar;
  }

  /**
   * Actualiza un lugar existente.
   * @param id ID del lugar a actualizar.
   * @param updateLugareDto Datos para actualizar el lugar.
   * @returns El lugar actualizado.
   * @throws NotFoundException si no se encuentra el lugar con el ID proporcionado.
   */
  async update(id: number, updateLugareDto: UpdateLugarDto) {
    const lugar = await this.lugaresRepository.preload({
      id: id,
      ...updateLugareDto,
    });
    if (!lugar) {
      throw new NotFoundException(`Lugar with ID ${id} not found.`);
    }
    return this.lugaresRepository.save(lugar);
  }

  /**
   * Elimina un lugar por su ID.
   * @param id ID del lugar a eliminar.
   * @throws NotFoundException si no se encuentra el lugar con el ID proporcionado.
   */
  async remove(id: number) {
    const lugar = await this.findOne(id);
    if (!lugar) {
      throw new NotFoundException(`Lugar with ID ${id} not found.`);
    }
    await this.lugaresRepository.remove(lugar);
  }
}
