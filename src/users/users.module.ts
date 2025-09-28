import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Cliente } from './entities/cliente.entity';
import { Productora } from '../productora/entities/productora.entity';
import { Validador } from '../validador/entities/validador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Cliente, Productora, Validador]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
