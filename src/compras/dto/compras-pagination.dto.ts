import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/commun/dto/pagination.dto';
import { EstadoCompra } from '../enums/estado-compra.enum';

export class ComprasPaginationDto extends PaginationDto {
  @ApiProperty({
    description: 'Estado de la compra para filtrar',
    example: EstadoCompra.ACEPTADA,
    required: false,
    enum: [
      EstadoCompra.PENDIENTE,
      EstadoCompra.ACEPTADA,
      EstadoCompra.RECHAZADA,
    ],
  })
  @IsOptional()
  @IsIn(
    [EstadoCompra.PENDIENTE, EstadoCompra.ACEPTADA, EstadoCompra.RECHAZADA],
    {
      message: 'El estado debe ser PENDIENTE, ACEPTADA o RECHAZADA',
    },
  )
  estado: EstadoCompra | null = null;
}
