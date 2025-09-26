import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEntradaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipo: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  precio: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  cantidad: number;
}
