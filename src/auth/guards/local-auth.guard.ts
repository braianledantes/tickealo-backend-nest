import {
  Injectable,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginDto } from '../dtos/login.dto';
import { Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Validar el DTO antes de proceder con Passport
    const loginDto = plainToClass(LoginDto, request.body);
    const errors = await validate(loginDto);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => {
          if (error.constraints) {
            return Object.values(error.constraints);
          }
          return '';
        })
        .filter((msg) => msg !== '')
        .flat();

      throw new BadRequestException(errorMessages);
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
