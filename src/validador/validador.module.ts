import { Module } from '@nestjs/common';
import { ValidadorService } from './validador.service';
import { ValidadorController } from './validador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Validador } from './entities/validador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Validador])],
  controllers: [ValidadorController],
  providers: [ValidadorService],
  exports: [ValidadorService],
})
export class ValidadorModule {}
