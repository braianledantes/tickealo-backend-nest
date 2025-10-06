import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { PaginationDto } from 'src/commun/dto/pagination.dto';
import { ImageFileValidationPipe } from 'src/files/pipes/image-file-validation.pipe';
import { ComprasService } from './compras.service';
import { ComprarEntradaDto } from './dto/comprar-entrada.dto';

@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Roles(Role.Cliente)
  @Post('comprar-entrada')
  @UseInterceptors(FileInterceptor('comprobanteTransferencia'))
  comprarEntrada(
    @GetUser('id') userId: number,
    @Body() comprarEntradaDto: ComprarEntradaDto,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.comprasService.comprarEntrada(userId, comprarEntradaDto, file);
  }

  @Roles(Role.Productora)
  @Get()
  getMisCompras(
    @GetUser('id') userId: number,
    @Body() paginationDto: PaginationDto,
  ) {
    return this.comprasService.getComprasDeMisEventos(userId, paginationDto);
  }

  @Roles(Role.Productora)
  @Patch('cancelar-compra/:compraId')
  cancelarCompra(
    @GetUser('id') userId: number,
    @Param('compraId', ParseIntPipe) compraId: number,
  ) {
    return this.comprasService.cancelarCompra(userId, compraId);
  }

  @Roles(Role.Productora)
  @Patch('aceptar-compra/:compraId')
  async aceptarCompra(
    @GetUser('id') userId: number,
    @Param('compraId', ParseIntPipe) compraId: number,
  ) {
    await this.comprasService.aceptarCompra(userId, compraId);
  }

  @Roles(Role.Cliente)
  @Get('mis-compras')
  getMisComprasCliente(
    @GetUser('id') userId: number,
    paginationDto: PaginationDto,
  ) {
    return this.comprasService.getComprasDeCliente(userId, paginationDto);
  }

  @Roles(Role.Cliente, Role.Productora)
  @Get(':compraId')
  getCompraById(
    @GetUser('id') userId: number,
    @Param('compraId', ParseIntPipe) compraId: number,
  ) {
    return this.comprasService.getCompra(userId, compraId);
  }
}
