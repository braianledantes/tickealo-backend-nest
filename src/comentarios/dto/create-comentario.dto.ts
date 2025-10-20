import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateComentarioDto {
  @ApiProperty({
    description: 'El contenido del comentario',
    example: 'Excelente evento, muy bien organizado.',
  })
  @IsString()
  @IsNotEmpty()
  comentario: string;

  @ApiProperty({
    description: 'La calificación del evento (1-5)',
    example: 5,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  calificacion: number;
}
