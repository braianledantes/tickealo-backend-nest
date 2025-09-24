import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaBancaria } from './entities/cuenta-bancaria.entity';
import { CuentaBancariaController } from './cuenta-bancaria.controller';
import { CuentaBancariaService } from './cuenta-bancaria.service';
import { Productora } from 'src/users/entities/productora.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaBancaria, Productora])],
  controllers: [CuentaBancariaController],
  providers: [CuentaBancariaService],
})
export class CuentaBancariaModule {}
