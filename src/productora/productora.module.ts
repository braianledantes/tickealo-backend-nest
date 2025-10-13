import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from 'src/clientes/clientes.module';
import { UsersModule } from 'src/users/users.module';
import { ValidadorModule } from 'src/validador/validador.module';
import { Productora } from './entities/productora.entity';
import { ProductoraController } from './productora.controller';
import { ProductoraEquipoService } from './services/productora-equipo.service';
import { ProductoraEventosService } from './services/productora-eventos.service';
import { ProductoraSeguidoresService } from './services/productora-seguidores.service';
import { ProductoraService } from './services/productora.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Productora]),
    ValidadorModule,
    ClientesModule,
    UsersModule,
  ],
  controllers: [ProductoraController],
  providers: [
    ProductoraService,
    ProductoraSeguidoresService,
    ProductoraEquipoService,
    ProductoraEventosService,
  ],
  exports: [ProductoraService],
})
export class ProductoraModule {}
