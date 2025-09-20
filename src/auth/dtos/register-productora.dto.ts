import { IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterProductoraDto extends RegisterUserDto {
  @ApiProperty()
  @IsString()
  cuit: string;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  direccion: string;

  @ApiProperty()
  @IsString()
  telefono: string;
}
