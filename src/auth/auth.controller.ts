import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/users/entities/user.entity';
import { ImageFileValidationPipe } from '../files/pipes/image-file-validation.pipe';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { Public } from './decorators/public.decorator';
import { RegisterClienteDto } from './dtos/register-cliente.dto';
import { RegisterProductoraDto } from './dtos/register-productora.dto';
import { RegisterValidadorDto } from './dtos/register-validador.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@GetUser() user: User) {
    return this.authService.login(user);
  }

  @Get('me')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @Public()
  @Post('register-productora')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registerProductora(
    @Body() registerProductoraDto: RegisterProductoraDto,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.authService.registerProductora(registerProductoraDto, file);
  }

  @Public()
  @Post('register-cliente')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registerCliente(
    @Body() registerClienteDto: RegisterClienteDto,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.authService.registerCliente(registerClienteDto, file);
  }

  @Public()
  @Post('register-validador')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registerValidador(
    @Body() registerValidadorDto: RegisterValidadorDto,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.authService.registerValidador(registerValidadorDto, file);
  }
}
