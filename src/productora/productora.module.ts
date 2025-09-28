import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidadorModule } from 'src/validador/validador.module';
import { Productora } from './entities/productora.entity';
import { ProductoraController } from './productora.controller';
import { ProductoraService } from './productora.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Productora]),
    ValidadorModule,
    UsersModule,
  ],
  controllers: [ProductoraController],
  providers: [ProductoraService],
  exports: [ProductoraService],
})
export class ProductoraModule {}
