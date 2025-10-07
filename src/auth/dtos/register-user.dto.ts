import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'juan_perez',
    type: String,
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Dirección de email del usuario',
    example: 'juan.perez@ejemplo.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'miContraseñaSegura123',
    minLength: 8,
    type: String,
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string;
}
