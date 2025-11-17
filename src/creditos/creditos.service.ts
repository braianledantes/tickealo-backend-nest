import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoraService } from 'src/productora/services/productora.service';
import { Repository } from 'typeorm';
import { CreateHistorialCreditoDto } from './dto/create-historial-credito.dto';
import { HistorialCredito } from './entities/historial-credito.entity';

@Injectable()
export class CreditosService {
  constructor(
    @InjectRepository(HistorialCredito)
    private readonly historialCreditoRepository: Repository<HistorialCredito>,
    private readonly productoraService: ProductoraService,
  ) {}

  async create(createCreditoDto: CreateHistorialCreditoDto) {
    const productora = await this.productoraService.findOneByUserId(
      createCreditoDto.userId,
    );

    if (!productora) {
      throw new NotFoundException('Productora not found for the given user ID');
    }

    const lastCredito = productora.creditosDisponibles;

    const historialCredito = this.historialCreditoRepository.create({
      paymentId: createCreditoDto.paymentId,
      creditos: createCreditoDto.creditos,
      productora: productora,
      creditosPrevios: lastCredito,
      creditosPosterior: lastCredito + createCreditoDto.creditos,
      precio: createCreditoDto.price,
    });

    // Update productora's available credits
    productora.creditosDisponibles += createCreditoDto.creditos;
    await this.productoraService.updateProductora(
      productora.userId,
      productora.user,
      productora,
    );

    return this.historialCreditoRepository.save(historialCredito);
  }

  async findAll(userId: number) {
    const productora = await this.productoraService.findOneByUserId(userId);

    if (!productora) {
      throw new NotFoundException('Productora not found for the given user ID');
    }

    const historialCreditos = await this.historialCreditoRepository.find({
      where: { productora: { userId } },
      order: { createdAt: 'DESC' },
    });

    return { historialCreditos };
  }
}
