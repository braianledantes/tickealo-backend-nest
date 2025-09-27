import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateLugarDto } from './dto/create-lugar.dto';
import { UpdateLugarDto } from './dto/update-lugar.dto';
import { LugaresService } from './lugares.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('lugares')
export class LugaresController {
  constructor(private readonly lugaresService: LugaresService) {}

  @Post()
  create(@Body() createLugareDto: CreateLugarDto) {
    return this.lugaresService.create(createLugareDto);
  }

  @Get()
  findAll() {
    return this.lugaresService.findAll();
  }

  @Get(':latitud/:longitud')
  findClosePlaces(
    @Param('latitud', ParseFloatPipe) latitud: number,
    @Param('longitud', ParseFloatPipe) longitud: number,
    @Query('radius', new DefaultValuePipe(5), ParseFloatPipe) radius: number,
  ) {
    return this.lugaresService.findClosePlaces(latitud, longitud, radius);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lugaresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLugareDto: UpdateLugarDto,
  ) {
    return this.lugaresService.update(id, updateLugareDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lugaresService.remove(id);
  }
}
