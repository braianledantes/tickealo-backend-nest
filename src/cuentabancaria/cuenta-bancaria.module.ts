import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaBancariaController } from './cuenta-bancaria.controller';
import { CuentaBancariaService } from './cuenta-bancaria.service';
import { CuentaBancaria } from './entities/cuenta-bancaria.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaBancaria]), UsersModule],
  controllers: [CuentaBancariaController],
  providers: [CuentaBancariaService],
  exports: [CuentaBancariaService],
})
export class CuentaBancariaModule {}
