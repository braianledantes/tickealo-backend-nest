import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaBancariaModule } from 'src/cuentabancaria/cuenta-bancaria.module';
import { FilesModule } from 'src/files/files.module';
import { LugaresModule } from 'src/lugares/lugares.module';
import { ProductoraModule } from 'src/productora/productora.module';
import { Entrada } from './entities/entrada.entity';
import { Evento } from './entities/evento.entity';
import { EventosController } from './eventos.controller';
import { EventosService } from './eventos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evento, Entrada]),
    ProductoraModule,
    CuentaBancariaModule,
    LugaresModule,
    FilesModule,
  ],
  controllers: [EventosController],
  providers: [EventosService],
})
export class EventosModule {}
