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
  @IsString()
  search: string = '';

  @IsOptional()
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @Type(() => Date)
  fechaInicio?: Date;

  @IsOptional()
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  @Type(() => Date)
  fechaFin?: Date;

  @IsOptional()
  @IsLatitude({ message: 'La latitud debe estar entre -90 y 90 grados' })
  @Type(() => Number)
  latitud?: number;

  @IsOptional()
  @IsLongitude({ message: 'La longitud debe estar entre -180 y 180 grados' })
  @Type(() => Number)
  longitud?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El radio debe ser un número válido' })
  @Min(0.1, { message: 'El radio debe ser mayor a 0.1 km' })
  @Max(1000, { message: 'El radio no puede ser mayor a 1000 km' })
  @Type(() => Number)
  radioKm?: number;

  @IsIn(['ASC', 'DESC'])
  orderDir: 'ASC' | 'DESC' = 'ASC';
}
