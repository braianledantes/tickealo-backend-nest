import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 10;

  @IsString()
  search?: string;

  @IsIn(['ASC', 'DESC'])
  orderDir: 'ASC' | 'DESC' = 'ASC';
}
