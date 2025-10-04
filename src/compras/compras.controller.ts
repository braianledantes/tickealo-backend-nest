import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
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
}
