import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditosController } from './creditos.controller';
import { CreditosService } from './creditos.service';
import { HistorialCredito } from './entities/historial-credito.entity';
import { ProductoraModule } from 'src/productora/productora.module';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialCredito]), ProductoraModule],
  controllers: [CreditosController],
  providers: [CreditosService],
  exports: [CreditosService],
})
export class CreditosModule {}
