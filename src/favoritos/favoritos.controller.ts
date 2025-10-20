import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { FavoritosService } from './favoritos.service';

@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'No autorizado' })
@ApiResponse({ status: 403, description: 'Acceso denegado' })
@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @ApiResponse({
    status: 200,
    description: 'Evento añadido a favoritos correctamente',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Post('eventos/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Cliente)
  addEventoToFavorites(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventoId: number,
  ) {
    return this.favoritosService.addEventoToFavorites(userId, eventoId);
  }

  @ApiResponse({
    status: 200,
    description: 'Evento eliminado de favoritos correctamente',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @Delete('eventos/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Cliente)
  removeEventoFromFavorites(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventoId: number,
  ) {
    return this.favoritosService.removeEventoFromFavorites(userId, eventoId);
  }

  @ApiResponse({
    status: 200,
    description: 'Lista de eventos favoritos obtenida correctamente',
  })
  @Get('eventos')
  @Roles(Role.Cliente)
  getFavoriteEventos(@GetUser('id') userId: number) {
    return this.favoritosService.getFavoriteEventos(userId);
  }
}
