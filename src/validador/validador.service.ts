import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Validador } from './entities/validador.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ValidadorService {
  constructor(
    @InjectRepository(Validador)
    private readonly validadoresRepository: Repository<Validador>,
  ) {}

  async findOneByEmail(email: string) {
    const validador = await this.validadoresRepository.findOne({
      where: { user: { email } },
    });
    if (!validador) {
      throw new NotFoundException('Validador no encontrado');
    }
    return validador;
  }
}
