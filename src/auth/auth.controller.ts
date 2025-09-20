import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { RegisterClienteDto } from './dtos/register-cliente.dto';
import { RegisterProductoraDto } from './dtos/register-productora.dto';
import { Role } from './enums/role.enum';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { registerValidadorDto } from './dtos/register-validador.dto';
import { ImageFileValidationPipe } from './pipes/image-file-validation.pipe';

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
    @Body() registerValidadorDto: registerValidadorDto,
    @UploadedFile(new ImageFileValidationPipe())
    file?: Express.Multer.File,
  ) {
    return this.authService.registerValidador(registerValidadorDto, file);
  }

  // endpoint example with role-based access control
  @Roles(Role.Admin)
  @Get('admin')
  getAdminContent(@GetUser() user: User) {
    return {
      message: 'This content is only for admins',
      user,
    };
  }

  // endpoint example with role-based access control
  @Roles(Role.Productora, Role.Admin)
  @Get('productora')
  getProductoraContent(@GetUser() user: User) {
    return {
      message: 'This content is only for productoras and admins',
      user,
    };
  }

  // endpoint example with role-based access control
  @Roles(Role.Validador)
  @Get('validador')
  getValidadorContent(@GetUser() user: User) {
    return {
      message: 'This content is only for validadores',
      user,
    };
  }

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
