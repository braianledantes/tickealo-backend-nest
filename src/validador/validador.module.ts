import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from 'src/clientes/clientes.module';
import { Validador } from './entities/validador.entity';
import { ValidadorService } from './validador.service';

@Module({
  imports: [TypeOrmModule.forFeature([Validador]), ClientesModule],
  providers: [ValidadorService],
  exports: [ValidadorService],
})
export class ValidadorModule {}
