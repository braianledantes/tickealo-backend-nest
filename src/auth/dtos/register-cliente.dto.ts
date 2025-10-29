import { IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClienteDto extends RegisterUserDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan',
    type: String,
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'Pérez',
    type: String,
  })
  @IsString()
  apellido: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '+54 9 11 1234-5678',
    type: String,
  })
  @IsString()
  telefono: string;

  @ApiProperty({
    description: 'País del cliente',
    example: 'Argentina',
    type: String,
  })
  @IsString()
  pais: string;
}
