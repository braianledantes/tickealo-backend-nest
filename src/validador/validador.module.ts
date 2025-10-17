import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from 'src/clientes/clientes.module';
import { Evento } from 'src/eventos/entities/evento.entity';
import { Validador } from './entities/validador.entity';
import { ValidadorController } from './validador.controller';
import { ValidadorService } from './validador.service';

@Module({
  imports: [TypeOrmModule.forFeature([Validador, Evento]), ClientesModule],
  providers: [ValidadorService],
  exports: [ValidadorService],
  controllers: [ValidadorController],
})
export class ValidadorModule {}
