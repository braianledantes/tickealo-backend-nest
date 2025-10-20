import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { Comentario } from './entities/comentario.entity';
import { Evento } from 'src/eventos/entities/evento.entity';
import { ClientesModule } from 'src/clientes/clientes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comentario, Evento]), ClientesModule],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}
