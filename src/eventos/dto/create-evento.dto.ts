import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsDate,
  IsDefined,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateEventoDto {
  @ApiProperty({
    example: 'Concierto de Rock',
    description: 'Nombre del evento',
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Un increíble concierto de rock con bandas locales.',
    description: 'Descripción del evento',
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    example: '2025-09-24T20:00:00Z',
    description: 'Fecha y hora de inicio del evento (formato ISO 8601)',
  })
  @IsDate()
  @Type(() => Date)
  inicioAt: Date;

  @ApiProperty({
    example: '2025-09-24T23:00:00Z',
    description: 'Fecha y hora de finalización del evento (formato ISO 8601)',
  })
  @IsDate()
  @Type(() => Date)
  finAt: Date;

  @ApiProperty({
    example: false,
    description: 'Indica si el evento ha sido cancelado',
  })
  @IsBoolean()
  @Type(() => Boolean)
  cancelado: boolean;

  @IsDefined()
  lugar: {
    latitud: number;
    longitud: number;
    direccion: string;
    ciudad: string;
    provincia: string;
  };

  @ApiProperty({
    type: 'array',
    example: [
      { tipo: 'General', precio: 1000, cantidad: 200 },
      { tipo: 'VIP', precio: 3000, cantidad: 50 },
    ],
    description:
      'Listado de tipos de entradas con su precio y cantidad disponible',
  })
  @IsDefined()
  @ArrayMinSize(1, { message: 'Debe haber al menos un tipo de entrada' })
  entradas: { tipo: string; precio: number; cantidad: number }[];

  @ApiProperty({
    example: 1,
    description: 'ID de la cuenta bancaria asociada al evento',
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  cuentaBancariaId: number;
}
