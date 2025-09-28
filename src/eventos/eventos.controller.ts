import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { MultipleImageFileValidationPipe } from 'src/files/pipes/multiple-image-file-validation.pipe';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { EventosService } from './eventos.service';
import { FindEventosDto } from './dto/find-eventos.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Roles(Role.Productora)
  @Post()
  create(
    @GetUser('id') userId: number,
    @Body() createEventoDto: CreateEventoDto,
  ) {
    return this.eventosService.create(userId, createEventoDto);
  }

  //NUEVO ENDPOINT: /eventos/proximos
  @Get('proximos')
  findUpcoming() {
    return this.eventosService.findUpcoming();
  }

  @Roles(Role.Productora)
  @Patch(':id/imagenes')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'portada', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  updateImagenes(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles(new MultipleImageFileValidationPipe())
    files: { portada?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    return this.eventosService.updateImagenes(userId, id, files);
  }

  @Get()
  findAll(@Query() findEventosDto: FindEventosDto) {
    return this.eventosService.findAllPaginated(findEventosDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.findOne(id);
  }

  @Roles(Role.Productora)
  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventoDto: UpdateEventoDto,
  ) {
    return this.eventosService.update(userId, id, updateEventoDto);
  }

  @Roles(Role.Productora, Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.eventosService.remove(userId, id);
  }
}
