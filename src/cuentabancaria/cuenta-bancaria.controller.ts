import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CuentaBancariaService } from './cuenta-bancaria.service';
import { CreateCuentaBancariaDto } from './dto/create-cuenta-bancaria.dto';
import { UpdateCuentaBancariaDto } from './dto/update-cuenta-bancaria.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Roles(Role.Productora)
@Controller('cuenta-bancaria')
export class CuentaBancariaController {
  constructor(private readonly mediospagoService: CuentaBancariaService) {}

  @Post()
  create(
    @GetUser('id') userId: number,
    @Body() createMediospagoDto: CreateCuentaBancariaDto,
  ) {
    return this.mediospagoService.create(userId, createMediospagoDto);
  }

  @Get()
  findByProductora(@GetUser('id') userId: number) {
    return this.mediospagoService.findByProductora(userId);
  }

  @Patch()
  update(
    @GetUser('id') userId: number,
    @Body() updateMediospagoDto: UpdateCuentaBancariaDto,
  ) {
    return this.mediospagoService.update(userId, updateMediospagoDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  remove(@GetUser('id') userId: number) {
    return this.mediospagoService.remove(userId);
  }
}
