import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidadorModule } from 'src/validador/validador.module';
import { Productora } from './entities/productora.entity';
import { ProductoraController } from './productora.controller';
import { ProductoraService } from './productora.service';

@Module({
  imports: [TypeOrmModule.forFeature([Productora]), ValidadorModule],
  controllers: [ProductoraController],
  providers: [ProductoraService],
  exports: [ProductoraService],
})
export class ProductoraModule {}
