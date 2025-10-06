import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCuentaBancariaDto } from './dto/create-cuenta-bancaria.dto';
import { UpdateCuentaBancariaDto } from './dto/update-cuenta-bancaria.dto';
import { CuentaBancaria } from './entities/cuenta-bancaria.entity';
import { ProductoraService } from 'src/productora/productora.service';

@Injectable()
export class CuentaBancariaService {
  constructor(
    @InjectRepository(CuentaBancaria)
    private readonly cuentaBancariaRepository: Repository<CuentaBancaria>,
    private readonly productoraService: ProductoraService,
  ) {}

  /**
   * Creates a new CuentaBancaria entity associated with a given Productora user ID.
   * @param userId - The ID of the Productora user.
   * @param createCuentaBancariaDto - The data to create the CuentaBancaria with.
   * @throws BadRequestException if the Productora does not exist or already has a CuentaBancaria.
   * @returns The created CuentaBancaria entity.
   */
  async create(
    userId: number,
    createCuentaBancariaDto: CreateCuentaBancariaDto,
  ) {
    const productora = await this.productoraService.findOneByUserId(userId);
    if (!productora) {
      throw new NotFoundException('Productora not found');
    }

    const existingCuenta = await this.cuentaBancariaRepository.findOne({
      where: { productora: { userId } },
    });

    if (existingCuenta) {
      throw new BadRequestException(
        'CuentaBancaria already exists for this Productora',
      );
    }

    const newcuentaBancaria = this.cuentaBancariaRepository.create({
      ...createCuentaBancariaDto,
      productora,
    });
    const savedCuentaBancaria =
      await this.cuentaBancariaRepository.save(newcuentaBancaria);

    return this.cuentaBancariaRepository.findOne({
      where: { id: savedCuentaBancaria.id },
      relations: ['productora'],
    });
  }

  /**
   * Finds the CuentaBancaria entity associated with a given Productora user ID.
   * @param userId - The ID of the Productora user.
   * @returns An array of CuentaBancaria entities.
   */
  async findByProductora(userId: number) {
    const cuentaBancaria = await this.cuentaBancariaRepository.findOne({
      where: { productora: { userId } },
      relations: ['productora'],
    });

    if (!cuentaBancaria) {
      throw new NotFoundException(
        'No CuentaBancaria found for this Productora',
      );
    }

    return cuentaBancaria;
  }

  /**
   * Finds a CuentaBancaria entity by its ID.
   * @param id - The ID of the CuentaBancaria to find.
   * @throws NotFoundException if the CuentaBancaria does not exist.
   * @returns The found CuentaBancaria entity.
   */
  async findById(id: number) {
    const cuentaBancaria = await this.cuentaBancariaRepository.findOne({
      where: { id },
      relations: ['productora'],
    });

    if (!cuentaBancaria) {
      throw new NotFoundException('CuentaBancaria not found');
    }

    return cuentaBancaria;
  }

  /**
   * Updates a CuentaBancaria entity associated with a given Productora user ID.
   * @param userId - The ID of the Productora user.
   * @param updateCuentaBancariaDto - The data to update the CuentaBancaria with.
   * @throws BadRequestException if the CuentaBancaria does not exist or does not belong to the user.
   * @returns The updated CuentaBancaria entity.
   */
  async update(
    userId: number,
    updateCuentaBancariaDto: UpdateCuentaBancariaDto,
  ) {
    const cuentaBancaria = await this.cuentaBancariaRepository.findOne({
      where: { productora: { userId } },
      relations: ['productora'],
    });

    if (!cuentaBancaria) {
      throw new NotFoundException('CuentaBancaria not found');
    }

    Object.assign(cuentaBancaria, updateCuentaBancariaDto);
    return this.cuentaBancariaRepository.save(cuentaBancaria);
  }

  /**
   * Deletes a CuentaBancaria entity by its ID and associated Productora user ID.
   * @param userId - The ID of the Productora user.
   * @param id - The ID of the CuentaBancaria to delete.
   * @throws BadRequestException if the CuentaBancaria does not exist or does not belong to the user.
   * @returns A message indicating successful deletion.
   */
  async remove(userId: number) {
    const cuentaBancaria = await this.cuentaBancariaRepository.findOne({
      where: { productora: { userId } },
      relations: ['productora'],
    });

    if (!cuentaBancaria) {
      throw new NotFoundException('CuentaBancaria not found');
    }

    await this.cuentaBancariaRepository.remove(cuentaBancaria);
  }
}
