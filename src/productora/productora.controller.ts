import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProductoraService } from './productora.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Roles(Role.Productora)
@Controller('productora')
export class ProductoraController {
  constructor(private readonly productoraService: ProductoraService) {}

  @Get('equipo')
  getEquipo(@GetUser('id') idProductora: number) {
    return this.productoraService.getEquipo(idProductora);
  }

  @Post('equipo/:userEmail')
  addMiembroEquipo(
    @GetUser('id') id: number,
    @Param('userEmail') userEmail: string,
  ) {
    return this.productoraService.addMiembroEquipo(id, userEmail);
  }

  @Delete('equipo/:userEmail')
  removeMiembroEquipo(
    @GetUser('id') id: number,
    @Param('userEmail') userEmail: string,
  ) {
    return this.productoraService.removeMiembroEquipo(id, userEmail);
  }
}
