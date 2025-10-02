import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
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
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProductoraDto } from './dtos/update-productora.dto';
import { UpdateClienteDto } from './dtos/update-cliente.dto';

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

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login-productora')
  async loginProductora(@GetUser() user: User) {
    return this.authService.loginProductora(user);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login-cliente')
  async loginCliente(@GetUser() user: User) {
    return this.authService.loginCliente(user);
  }

  @ApiBearerAuth()
  @Get('me')
  getProfile(@GetUser('id') userId: number) {
    return this.authService.getProfile(userId);
  }

  @ApiBearerAuth()
  @Patch('productora-perfil')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  updeteProductoraProfile(
    @GetUser('id') userId: number,
    @Body() updateData: UpdateProductoraDto,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.authService.updateProductora(userId, updateData, file);
  }

  @ApiBearerAuth()
  @Patch('cliente-perfil')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  updateClienteProfile(
    @GetUser('id') userId: number,
    @Body() updateData: UpdateClienteDto,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.authService.updateCliente(userId, updateData, file);
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
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
