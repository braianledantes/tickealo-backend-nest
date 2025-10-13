import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { PaginationDto } from 'src/commun/dto/pagination.dto';
import { ImageFileValidationPipe } from 'src/files/pipes/image-file-validation.pipe';
import { ComprasService } from './compras.service';
import { ComprarEntradaDto } from './dto/comprar-entrada.dto';

@ApiTags('Compras')
@ApiBearerAuth()
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Roles(Role.Cliente)
  @Post('iniciar-compra-entrada')
  iniciarComprarEntrada(
    @GetUser('id') userId: number,
    @Body() comprarEntradaDto: ComprarEntradaDto,
  ) {
    return this.comprasService.iniciarComprarEntrada(userId, comprarEntradaDto);
  }

  @Roles(Role.Cliente)
  @Put(':compraId/finalizar-compra-entrada')
  @UseInterceptors(FileInterceptor('comprobanteTransferencia'))
  finalizarComprarEntrada(
    @GetUser('id') userId: number,
    @Param('compraId', ParseIntPipe) compraId: number,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.comprasService.finalizarCompraEntrada(userId, compraId, file);
  }

  @ApiOperation({
    summary: 'Obtener compras de eventos de la productora autenticada',
  })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @Roles(Role.Productora)
  @Get()
  getMisCompras(
    @GetUser('id') userId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comprasService.getComprasDeMisEventos(userId, paginationDto);
  }

  @ApiOperation({ summary: 'Cancelar una compra' })
  @ApiParam({ name: 'compraId', description: 'ID de la compra a cancelar' })
  @ApiResponse({ status: 200, description: 'Compra cancelada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  @Roles(Role.Productora)
  @Patch('cancelar-compra/:compraId')
  cancelarCompra(
    @GetUser('id') userId: number,
    @Param('compraId', ParseIntPipe) compraId: number,
  ) {
    return this.comprasService.rechazarCompra(userId, compraId);
  }

  @ApiOperation({ summary: 'Aceptar una compra' })
  @ApiParam({ name: 'compraId', description: 'ID de la compra a aceptar' })
  @ApiResponse({ status: 200, description: 'Compra aceptada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  @Roles(Role.Productora)
  @Patch('aceptar-compra/:compraId')
  async aceptarCompra(
    @GetUser('id') userId: number,
    @Param('compraId', ParseIntPipe) compraId: number,
  ) {
    await this.comprasService.aceptarCompra(userId, compraId);
  }

  @ApiOperation({ summary: 'Obtener compras del cliente autenticado' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras del cliente obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo clientes' })
  @Roles(Role.Cliente)
  @Get('mis-compras')
  getMisComprasCliente(
    @GetUser('id') userId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.comprasService.getComprasDeCliente(userId, paginationDto);
  }

  @ApiOperation({ summary: 'Obtener detalles de una compra específica' })
  @ApiParam({ name: 'compraId', description: 'ID de la compra' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la compra obtenidos exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  @Roles(Role.Cliente, Role.Productora)
  @Get(':compraId')
  getCompraById(
    @GetUser('id') userId: number,
    @Param('compraId', ParseIntPipe) compraId: number,
  ) {
    return this.comprasService.getCompra(userId, compraId);
  }
}
