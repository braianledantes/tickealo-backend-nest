import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoraModule } from 'src/productora/productora.module';
import { CuentaBancariaController } from './cuenta-bancaria.controller';
import { CuentaBancariaService } from './cuenta-bancaria.service';
import { CuentaBancaria } from './entities/cuenta-bancaria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaBancaria]), ProductoraModule],
  controllers: [CuentaBancariaController],
  providers: [CuentaBancariaService],
  exports: [CuentaBancariaService],
})
export class CuentaBancariaModule {}
