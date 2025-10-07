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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { ImageFileValidationPipe } from '../files/pipes/image-file-validation.pipe';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { Public } from './decorators/public.decorator';
import { RegisterClienteDto } from './dtos/register-cliente.dto';
import { RegisterProductoraDto } from './dtos/register-productora.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UpdateProductoraDto } from './dtos/update-productora.dto';
import { UpdateClienteDto } from './dtos/update-cliente.dto';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Iniciar sesión usuario general',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'jwt_token_here',
        user: { id: 1, email: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@GetUser() user: User) {
    return this.authService.login(user);
  }

  @ApiOperation({
    summary: 'Iniciar sesión productora',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso para productora' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login-productora')
  async loginProductora(@GetUser() user: User) {
    return this.authService.loginProductora(user);
  }

  @ApiOperation({
    summary: 'Iniciar sesión cliente',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso para cliente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login-cliente')
  async loginCliente(@GetUser() user: User) {
    return this.authService.loginCliente(user);
  }

  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: '🔐 **Acceso:** Usuarios autenticados (Todos los roles)',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBearerAuth()
  @Get('me')
  getProfile(@GetUser('id') userId: number) {
    return this.authService.getProfile(userId);
  }

  @ApiOperation({
    summary: 'Actualizar perfil de productora',
    description: '🏢 **Acceso:** Solo Productoras autenticadas',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductoraDto })
  @ApiResponse({
    status: 200,
    description: 'Perfil de productora actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo productoras',
  })
  @ApiBearerAuth()
  @Roles(Role.Productora)
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

  @ApiOperation({
    summary: 'Actualizar perfil de cliente',
    description: '👤 **Acceso:** Solo Clientes autenticados',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateClienteDto })
  @ApiResponse({
    status: 200,
    description: 'Perfil de cliente actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo clientes' })
  @ApiBearerAuth()
  @Roles(Role.Cliente)
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

  @ApiOperation({
    summary: 'Registrar nueva productora',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterProductoraDto })
  @ApiResponse({
    status: 201,
    description: 'Productora registrada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos' })
  @ApiResponse({ status: 409, description: 'La productora ya existe' })
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

  @ApiOperation({
    summary: 'Registrar nuevo cliente',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterClienteDto })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos' })
  @ApiResponse({ status: 409, description: 'El cliente ya existe' })
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

  @ApiOperation({
    summary: 'Verificar email mediante token',
    description: '🌐 **Acceso:** Público - No requiere autenticación',
  })
  @ApiQuery({ name: 'token', description: 'Token de verificación de email' })
  @ApiResponse({ status: 200, description: 'Email verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  @Public()
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
