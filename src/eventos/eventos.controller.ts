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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { PaginationDto } from 'src/commun/dto/pagination.dto';
import { MultipleImageFileValidationPipe } from 'src/files/pipes/multiple-image-file-validation.pipe';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { EventosService } from './eventos.service';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Roles(Role.Productora)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'portada', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  create(
    @GetUser('id') userId: number,
    @Body() createEventoDto: CreateEventoDto,
    @UploadedFiles(new MultipleImageFileValidationPipe())
    files: { portada?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    return this.eventosService.create(userId, createEventoDto, files);
  }

  @Get()
  findAll(@Body() paginationDto: PaginationDto) {
    return this.eventosService.findAllPaginated(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.findOne(id);
  }

  @Roles(Role.Productora)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'portada', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventoDto: UpdateEventoDto,
    @UploadedFiles(new MultipleImageFileValidationPipe())
    files: { portada?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    return this.eventosService.update(userId, id, updateEventoDto, files);
  }

  @Roles(Role.Productora, Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.eventosService.remove(userId, id);
  }
}
