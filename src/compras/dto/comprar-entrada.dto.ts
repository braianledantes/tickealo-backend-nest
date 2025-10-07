import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

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
    description: 'Comprobante de transferencia bancaria',
    type: 'string',
    format: 'binary',
  })
  comprobanteTransferencia?: Express.Multer.File;
}
