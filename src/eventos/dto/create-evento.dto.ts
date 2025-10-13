import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { CreateLugarDto } from 'src/lugares/dto/create-lugar.dto';
import { CreateEntradaDto } from './create-entrada.dto';

export class CreateEventoDto {
  @ApiProperty({
    example: 'Concierto de Rock',
    description: 'Nombre del evento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @ApiProperty({
    example: 'Un increíble concierto de rock con bandas locales.',
    description: 'Descripción del evento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descripcion: string;

  @ApiProperty({
    example: '2025-09-24T20:00:00Z',
    description: 'Fecha y hora de inicio del evento (formato ISO 8601)',
  })
  @IsDate()
  @MinDate(new Date(), {
    message: 'La fecha de inicio debe ser en el futuro',
  })
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
  @IsOptional()
  @Type(() => Boolean)
  cancelado: boolean = false;

  @ApiProperty({
    example: {
      latitud: -34.6037,
      longitud: -58.3816,
      direccion: 'Av. Corrientes 1234',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
    },
    description: 'Ubicación del evento',
  })
  @ValidateNested()
  @Type(() => CreateLugarDto)
  lugar: CreateLugarDto;

  @ApiProperty({
    type: 'array',
    example: [
      { tipo: 'General', precio: 1000, cantidad: 200 },
      { tipo: 'VIP', precio: 3000, cantidad: 50 },
    ],
    description:
      'Listado de tipos de entradas con su precio y cantidad disponible',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe haber al menos un tipo de entrada' })
  @ArrayMaxSize(10, { message: 'Máximo 10 tipos de entradas permitidos' })
  @ValidateNested({ each: true })
  @Type(() => CreateEntradaDto)
  entradas: CreateEntradaDto[];
}
