import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Validador } from './entities/validador.entity';
import { ValidadorService } from './validador.service';

@Module({
  imports: [TypeOrmModule.forFeature([Validador]), UsersModule],
  providers: [ValidadorService],
  exports: [ValidadorService],
})
export class ValidadorModule {}
