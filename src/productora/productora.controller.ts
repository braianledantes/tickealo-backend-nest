import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { ProductoraService } from './productora.service';

@ApiBearerAuth()
@Controller('productora')
export class ProductoraController {
  constructor(private readonly productoraService: ProductoraService) {}

  @Roles(Role.Productora)
  @Get('eventos')
  getAllEventos(@GetUser('id') idProductora: number) {
    return this.productoraService.getEventosProductora(idProductora);
  }

  @Get(':id/eventos')
  getEventos(@Param('id', ParseIntPipe) idProductora: number) {
    return this.productoraService.getEventosProductora(idProductora);
  }

  @Roles(Role.Productora)
  @Get('equipo')
  getEquipo(@GetUser('id') idProductora: number) {
    return this.productoraService.getEquipo(idProductora);
  }

  @Roles(Role.Productora)
  @Post('equipo/:userEmail')
  addMiembroEquipo(
    @GetUser('id') id: number,
    @Param('userEmail') userEmail: string,
  ) {
    return this.productoraService.addMiembroEquipo(id, userEmail);
  }

  @Roles(Role.Productora)
  @Delete('equipo/:userEmail')
  removeMiembroEquipo(
    @GetUser('id') id: number,
    @Param('userEmail') userEmail: string,
  ) {
    return this.productoraService.removeMiembroEquipo(id, userEmail);
  }

  @Roles(Role.Productora)
  @Get('seguidores')
  getSeguidores(@GetUser('id') idProductora: number) {
    return this.productoraService.getSeguidores(idProductora);
  }

  @Roles(Role.Cliente)
  @Post(':idProductora/seguir')
  seguirProductora(
    @GetUser('id') idCliente: number,
    @Param('idProductora', ParseIntPipe) idProductora: number,
  ) {
    return this.productoraService.seguirProductora(idCliente, idProductora);
  }

  @Roles(Role.Cliente)
  @Delete(':idProductora/seguir')
  dejarDeSeguirProductora(
    @GetUser('id') idCliente: number,
    @Param('idProductora', ParseIntPipe) idProductora: number,
  ) {
    return this.productoraService.dejarDeSeguirProductora(
      idCliente,
      idProductora,
    );
  }
}
