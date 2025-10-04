import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class ComprarEntradaDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  idEntrada: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cant: number;
}
