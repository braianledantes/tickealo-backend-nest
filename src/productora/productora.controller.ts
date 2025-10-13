import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { ProductoraEquipoService } from './services/productora-equipo.service';
import { ProductoraEventosService } from './services/productora-eventos.service';
import { ProductoraSeguidoresService } from './services/productora-seguidores.service';

@ApiTags('Productoras')
@ApiBearerAuth()
@Controller('productora')
export class ProductoraController {
  constructor(
    private readonly productoraEventosService: ProductoraEventosService,
    private readonly productoraEquipoService: ProductoraEquipoService,
    private readonly productoraSeguidoresService: ProductoraSeguidoresService,
  ) {}

  @ApiOperation({
    summary: 'Obtener eventos de la productora autenticada',
    description: '🏢 **Acceso:** Solo Productoras autenticadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos de la productora obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @Roles(Role.Productora)
  @Get('eventos')
  getAllEventos(@GetUser('id') idProductora: number) {
    return this.productoraEventosService.getEventosProductora(idProductora);
  }

  @ApiOperation({
    summary: 'Obtener eventos de una productora específica',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiParam({ name: 'id', description: 'ID de la productora' })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos de la productora obtenida exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Productora no encontrada' })
  @Get(':id/eventos')
  getEventos(@Param('id', ParseIntPipe) idProductora: number) {
    return this.productoraEventosService.getEventosProductora(idProductora);
  }

  @ApiOperation({
    summary: 'Obtener equipo de la productora autenticada',
    description: '🏢 **Acceso:** Solo Productoras autenticadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de miembros del equipo obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @Roles(Role.Productora)
  @Get('equipo')
  getEquipo(@GetUser('id') idProductora: number) {
    return this.productoraEquipoService.getEquipo(idProductora);
  }

  @ApiOperation({
    summary: 'Agregar miembro al equipo de la productora',
    description: '🏢 **Acceso:** Solo Productoras autenticadas',
  })
  @ApiParam({
    name: 'userEmail',
    description: 'Email del usuario a agregar al equipo',
  })
  @ApiResponse({
    status: 201,
    description: 'Miembro agregado al equipo exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Email inválido o usuario no encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya es miembro del equipo',
  })
  @Roles(Role.Productora)
  @Post('equipo/:userEmail')
  addMiembroEquipo(
    @GetUser('id') id: number,
    @Param('userEmail') userEmail: string,
  ) {
    return this.productoraEquipoService.addMiembroEquipo(id, userEmail);
  }

  @ApiOperation({
    summary: 'Remover miembro del equipo de la productora',
    description: '🏢 **Acceso:** Solo Productoras autenticadas',
  })
  @ApiParam({
    name: 'userEmail',
    description: 'Email del usuario a remover del equipo',
  })
  @ApiResponse({
    status: 200,
    description: 'Miembro removido del equipo exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Email inválido o usuario no encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({
    status: 404,
    description: 'El usuario no es miembro del equipo',
  })
  @Roles(Role.Productora)
  @Delete('equipo/:userEmail')
  removeMiembroEquipo(
    @GetUser('id') id: number,
    @Param('userEmail') userEmail: string,
  ) {
    return this.productoraEquipoService.removeMiembroEquipo(id, userEmail);
  }

  @ApiOperation({
    summary: 'Obtener seguidores de la productora autenticada',
    description: '🏢 **Acceso:** Solo Productoras autenticadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguidores obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @Roles(Role.Productora)
  @Get('seguidores')
  getSeguidores(@GetUser('id') idProductora: number) {
    return this.productoraSeguidoresService.getSeguidores(idProductora);
  }

  @ApiOperation({
    summary: 'Seguir una productora',
    description: '👤 **Acceso:** Solo Clientes autenticados',
  })
  @ApiParam({
    name: 'idProductora',
    description: 'ID de la productora a seguir',
  })
  @ApiResponse({ status: 201, description: 'Productora seguida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo clientes' })
  @ApiResponse({ status: 404, description: 'Productora no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya sigues a esta productora' })
  @Roles(Role.Cliente)
  @Post(':idProductora/seguir')
  seguirProductora(
    @GetUser('id') idCliente: number,
    @Param('idProductora', ParseIntPipe) idProductora: number,
  ) {
    return this.productoraSeguidoresService.seguirProductora(
      idCliente,
      idProductora,
    );
  }

  @ApiOperation({
    summary: 'Dejar de seguir una productora',
    description: '👤 **Acceso:** Solo Clientes autenticados',
  })
  @ApiParam({
    name: 'idProductora',
    description: 'ID de la productora a dejar de seguir',
  })
  @ApiResponse({
    status: 200,
    description: 'Dejaste de seguir la productora exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo clientes' })
  @ApiResponse({
    status: 404,
    description: 'Productora no encontrada o no la seguías',
  })
  @Roles(Role.Cliente)
  @Delete(':idProductora/seguir')
  dejarDeSeguirProductora(
    @GetUser('id') idCliente: number,
    @Param('idProductora', ParseIntPipe) idProductora: number,
  ) {
    return this.productoraSeguidoresService.dejarDeSeguirProductora(
      idCliente,
      idProductora,
    );
  }
}
