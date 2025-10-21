import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from 'src/clientes/clientes.module';
import { EventosModule } from 'src/eventos/eventos.module';
import { MailModule } from 'src/mail/mail.module';
import { Recordatorio } from './entities/recordatorio.entity';
import { RecordatoriosController } from './recordatorios.controller';
import { RecordatoriosService } from './recordatorios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recordatorio]),
    EventosModule,
    ClientesModule,
    MailModule,
  ],
  controllers: [RecordatoriosController],
  providers: [RecordatoriosService],
  exports: [RecordatoriosService],
})
export class RecordatoriosModule {}
