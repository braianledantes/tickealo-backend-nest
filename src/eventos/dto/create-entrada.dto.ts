import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEntradaDto {
  @ApiProperty({
    description: 'Tipo de entrada',
    example: 'General',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipo: string;

  @ApiProperty({
    description: 'Precio de la entrada en pesos',
    example: 1500,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  precio: number;

  @ApiProperty({
    description: 'Cantidad de entradas disponibles',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  cantidad: number;
}
