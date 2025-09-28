import { Controller } from '@nestjs/common';
import { ValidadorService } from './validador.service';

@Controller('validador')
export class ValidadorController {
  constructor(private readonly validadorService: ValidadorService) {}
}
