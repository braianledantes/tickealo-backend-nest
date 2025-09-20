import { IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClienteDto extends RegisterUserDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  apellido: string;

  @ApiProperty()
  @IsString()
  telefono: string;
}
