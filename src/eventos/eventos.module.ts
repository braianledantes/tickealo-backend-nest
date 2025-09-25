import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entrada } from './entities/entrada.entity';
import { Evento } from './entities/evento.entity';
import { UsersModule } from 'src/users/users.module';
import { CuentaBancariaModule } from 'src/cuentabancaria/cuenta-bancaria.module';
import { LugaresModule } from 'src/lugares/lugares.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evento, Entrada]),
    UsersModule,
    CuentaBancariaModule,
    LugaresModule,
    FilesModule,
  ],
  controllers: [EventosController],
  providers: [EventosService],
})
export class EventosModule {}
