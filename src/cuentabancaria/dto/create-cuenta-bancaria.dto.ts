import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumberString,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCuentaBancariaDto {
  @ApiProperty({
    description: 'Nombre completo del titular de la cuenta',
    example: 'Juan Pérez',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  nombreTitular: string;

  @ApiProperty({
    description: 'Nombre del banco',
    example: 'Banco Galicia',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  nombreBanco: string;

  @ApiProperty({
    description:
      'Alias de la cuenta bancaria (solo letras minúsculas, números y puntos)',
    example: 'mi.cuenta.banco',
    minLength: 6,
    maxLength: 20,
    pattern: '^[a-z0-9]+(\.[a-z0-9]+)*$',
  })
  @IsString()
  @Length(6, 20)
  @Matches(/^[a-z0-9]+(\.[a-z0-9]+)*$/, {
    message:
      'El alias debe contener solo letras minúsculas, números y puntos. No puede comenzar ni terminar con punto ni tener puntos consecutivos.',
  })
  alias: string;

  @ApiProperty({
    description:
      'CBU de la cuenta bancaria (debe tener exactamente 22 dígitos)',
    example: '0070088420000000000011',
    minLength: 22,
    maxLength: 22,
  })
  @IsNumberString()
  @Length(22, 22)
  cbu: string;

  @ApiProperty({
    description: 'Instrucciones adicionales para la transferencia',
    example:
      'Por favor incluir el número de pedido en el concepto de la transferencia',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  instrucciones: string;
}
