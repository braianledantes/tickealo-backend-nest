import { Module } from '@nestjs/common';
import { LugaresService } from './lugares.service';
import { LugaresController } from './lugares.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lugar } from './entities/lugar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lugar])],
  controllers: [LugaresController],
  providers: [LugaresService],
})
export class LugaresModule {}
