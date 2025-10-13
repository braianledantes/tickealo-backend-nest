import { Module } from '@nestjs/common';
import { ComprasService } from './services/compras.service';
import { ComprasController } from './compras.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { EventosModule } from 'src/eventos/eventos.module';
import { FilesModule } from 'src/files/files.module';
import { TicketsModule } from 'src/tickets/tickets.module';
import { ClientesModule } from 'src/clientes/clientes.module';
import { JobsComprasService } from './services/jobs-compras.service';
import { ComprasProductoraService } from './services/compras-productora.service';
import { ComprasClienteService } from './services/compras-cliente.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Compra]),
    ClientesModule,
    EventosModule,
    TicketsModule,
    FilesModule,
  ],
  controllers: [ComprasController],
  providers: [
    ComprasService,
    ComprasProductoraService,
    ComprasClienteService,
    JobsComprasService,
  ],
})
export class ComprasModule {}
