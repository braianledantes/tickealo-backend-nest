import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsDate,
  IsNumber,
  IsLatitude,
  IsLongitude,
  Min,
  Max,
  IsString,
  IsIn,
} from 'class-validator';
import { PaginationDto } from 'src/commun/dto/pagination.dto';

export class FindEventosDto extends PaginationDto {
  @ApiProperty({
    description:
      'Término de búsqueda para filtrar eventos por nombre o descripción',
    example: 'concierto rock',
    default: '',
    required: false,
  })
  @IsString()
  search: string = '';

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar eventos (formato ISO 8601)',
    example: '2025-01-01T00:00:00Z',
    type: Date,
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @Type(() => Date)
  fechaInicio?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtrar eventos (formato ISO 8601)',
    example: '2025-12-31T23:59:59Z',
    type: Date,
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  @Type(() => Date)
  fechaFin?: Date;

  @ApiPropertyOptional({
    description: 'Latitud para búsqueda geográfica',
    example: -34.6037,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsLatitude({ message: 'La latitud debe estar entre -90 y 90 grados' })
  @Type(() => Number)
  latitud?: number;

  @ApiPropertyOptional({
    description: 'Longitud para búsqueda geográfica',
    example: -58.3816,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsLongitude({ message: 'La longitud debe estar entre -180 y 180 grados' })
  @Type(() => Number)
  longitud?: number;

  @ApiPropertyOptional({
    description: 'Radio de búsqueda en kilómetros',
    example: 10,
    minimum: 0.1,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El radio debe ser un número válido' })
  @Min(0.1, { message: 'El radio debe ser mayor a 0.1 km' })
  @Max(1000, { message: 'El radio no puede ser mayor a 1000 km' })
  @Type(() => Number)
  radioKm?: number;

  @ApiProperty({
    description: 'Dirección de ordenamiento',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    example: 'ASC',
  })
  @IsIn(['ASC', 'DESC'])
  orderDir: 'ASC' | 'DESC' = 'ASC';
}
