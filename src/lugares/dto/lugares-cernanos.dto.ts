import { IsNumber, IsNumberString } from 'class-validator';

export class LugaresCernanosDto {
  @IsNumberString()
  latitud: number;

  @IsNumberString()
  longitud: number;

  @IsNumber()
  radius: number;
}
