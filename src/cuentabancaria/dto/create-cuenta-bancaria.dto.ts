import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumberString,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCuentaBancariaDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  nombreTitular: string;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  nombreBanco: string;

  @ApiProperty()
  @IsString()
  @Length(6, 20)
  @Matches(/^[a-z0-9]+(\.[a-z0-9]+)*$/, {
    message:
      'El alias debe contener solo letras minúsculas, números y puntos. No puede comenzar ni terminar con punto ni tener puntos consecutivos.',
  })
  alias: string;

  @ApiProperty()
  @IsNumberString()
  @Length(22, 22)
  cbu: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  instrucciones: string;
}
