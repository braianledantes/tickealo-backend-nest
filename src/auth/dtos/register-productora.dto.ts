import { IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterProductoraDto extends RegisterUserDto {
  @ApiProperty({
    description: 'CUIT de la productora',
    example: '20-12345678-9',
    type: String,
  })
  @IsString()
  cuit: string;

  @ApiProperty({
    description: 'Nombre comercial de la productora',
    example: 'Eventos Increíbles S.A.',
    type: String,
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Dirección física de la productora',
    example: 'Av. Corrientes 1234, CABA',
    type: String,
  })
  @IsString()
  direccion: string;

  @ApiProperty({
    description: 'Número de teléfono de contacto',
    example: '+54 11 4567-8900',
    type: String,
  })
  @IsString()
  telefono: string;

  @ApiProperty({
    description: 'Logo o imagen de perfil de la productora',
    type: 'string',
    format: 'binary',
    required: false,
  })
  imagenPerfil?: Express.Multer.File;
}
