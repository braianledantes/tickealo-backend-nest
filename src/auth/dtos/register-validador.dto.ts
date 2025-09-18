import { IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

export class registerValidadorDto extends RegisterUserDto {
  @IsString()
  nombre: string;
}
