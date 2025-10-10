import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from 'src/clientes/clientes.module';
import { Validador } from './entities/validador.entity';
import { ValidadorService } from './validador.service';
import { ValidadorController } from './validador.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Validador]), ClientesModule],
  providers: [ValidadorService],
  exports: [ValidadorService],
  controllers: [ValidadorController],
})
export class ValidadorModule {}
