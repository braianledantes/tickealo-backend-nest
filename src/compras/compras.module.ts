import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from 'src/clientes/clientes.module';
import { EventosModule } from 'src/eventos/eventos.module';
import { FilesModule } from 'src/files/files.module';
import { TicketsModule } from 'src/tickets/tickets.module';
import { ComprasController } from './compras.controller';
import { Compra } from './entities/compra.entity';
import { Punto } from './entities/punto.entity';
import { ComprasClienteService } from './services/compras-cliente.service';
import { ComprasProductoraService } from './services/compras-productora.service';
import { ComprasService } from './services/compras.service';
import { JobsComprasService } from './services/jobs-compras.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Compra, Punto]),
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
