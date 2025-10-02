import { PartialType } from '@nestjs/swagger';
import { RegisterProductoraDto } from './register-productora.dto';

export class UpdateProductoraDto extends PartialType(RegisterProductoraDto) {}
