import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity';
import { ClientesController } from './clientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente]), UsersModule],
  providers: [ClientesService],
  exports: [ClientesService],
  controllers: [ClientesController],
})
export class ClientesModule {}
