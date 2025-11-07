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
import { ComprasService } from './services/compras.service';
import { ComprarEntradaDto } from './dto/comprar-entrada.dto';
import { ComprasClienteService } from './services/compras-cliente.service';
import { ComprasProductoraService } from './services/compras-productora.service';
import { ComprasPaginationDto } from './dto/compras-pagination.dto';

@ApiTags('Compras')
@ApiBearerAuth()
@Controller('compras')
export class ComprasController {
  constructor(
    private readonly comprasService: ComprasService,
    private readonly comprasClienteService: ComprasClienteService,
    private readonly comprasProductoraService: ComprasProductoraService,
  ) {}

  @ApiOperation({ summary: 'Iniciar el proceso de compra de entradas' })
  @ApiBody({ type: ComprarEntradaDto })
  @ApiResponse({
    status: 201,
    description: 'Proceso de compra iniciado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo clientes' })
  @ApiResponse({ status: 404, description: 'Evento o entrada no encontrada' })
  @ApiResponse({
    status: 400,
    description:
      'No se pueden comprar entradas porque el evento ya ha finalizado.',
  })
  @ApiResponse({
    status: 400,
    description: 'No hay stock de entradas disponibles para la compra.',
  })
  @Roles(Role.Cliente)
  @Post('iniciar-compra-entrada')
  iniciarComprarEntrada(
    @GetUser('id') userId: number,
    @Body() comprarEntradaDto: ComprarEntradaDto,
  ) {
    return this.comprasClienteService.iniciarComprarEntrada(
      userId,
      comprarEntradaDto,
    );
  }

  @ApiOperation({
    summary: 'Finalizar el proceso de compra de entradas',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Compra finalizada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo clientes' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - No es tu compra',
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'La compra ya fue finalizada o cancelada.',
  })
  @Roles(Role.Cliente)
  @Put(':compraId/finalizar-compra-entrada')
  @UseInterceptors(FileInterceptor('comprobanteTransferencia'))
  finalizarComprarEntrada(
    @GetUser('id') userId: number,
    @Param('compraId', ParseIntPipe) compraId: number,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.comprasClienteService.finalizarCompraEntrada(
      userId,
      compraId,
      file,
    );
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
    @Query() paginationDto: ComprasPaginationDto,
  ) {
    return this.comprasProductoraService.getComprasDeMisEventos(
      userId,
      paginationDto,
    );
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
    return this.comprasProductoraService.rechazarCompra(userId, compraId);
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
    await this.comprasProductoraService.aceptarCompra(userId, compraId);
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
    @Query() paginationDto: ComprasPaginationDto,
  ) {
    return this.comprasClienteService.getComprasDeCliente(
      userId,
      paginationDto,
    );
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
