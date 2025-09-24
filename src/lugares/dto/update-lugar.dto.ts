import { PartialType } from '@nestjs/swagger';
import { CreateLugarDto } from './create-lugar.dto';

export class UpdateLugarDto extends PartialType(CreateLugarDto) {}
