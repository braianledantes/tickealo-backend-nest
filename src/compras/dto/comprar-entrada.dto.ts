import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class ComprarEntradaDto {
  @ApiProperty({
    description: 'ID de la entrada que se desea comprar',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  idEntrada: number;

  @ApiProperty({
    description: 'Cantidad de entradas a comprar',
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cant: number;

  @ApiPropertyOptional({
    description: 'Cantidad de puntos a utilizar en la compra',
    example: 100,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantPuntos: number;

  @ApiPropertyOptional({
    description: 'Comprobante de transferencia bancaria',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  comprobanteTransferencia?: Express.Multer.File;
}
