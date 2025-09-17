import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';

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
}
