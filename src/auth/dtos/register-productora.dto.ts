import { IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

export class RegisterProductoraDto extends RegisterUserDto {
  @IsString()
  cuit: string;

  @IsString()
  nombre: string;

  @IsString()
  direccion: string;

  @IsString()
  telefono: string;
}
