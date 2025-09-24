import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length } from 'class-validator';

export class CreateLugarDto {
  @ApiProperty({ example: -34.6037, description: 'Latitud del lugar' })
  @IsNumber()
  latitud: number;

  @ApiProperty({ example: -58.3816, description: 'Longitud del lugar' })
  @IsNumber()
  longitud: number;

  @ApiProperty({
    example: 'Av. Corrientes 1234',
    description: 'Dirección del lugar',
  })
  @IsString()
  direccion: string;

  @ApiProperty({ example: 'Buenos Aires', description: 'Ciudad del lugar' })
  @IsString()
  @Length(2, 100)
  ciudad: string;

  @ApiProperty({ example: 'Buenos Aires', description: 'Provincia del lugar' })
  @IsString()
  @Length(2, 100)
  provincia: string;
}
