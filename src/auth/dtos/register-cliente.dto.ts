import { IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

export class RegisterClienteDto extends RegisterUserDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  telefono: string;
}
