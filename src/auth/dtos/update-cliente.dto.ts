import { PartialType } from '@nestjs/swagger';
import { RegisterClienteDto } from './register-cliente.dto';

export class UpdateClienteDto extends PartialType(RegisterClienteDto) {}
