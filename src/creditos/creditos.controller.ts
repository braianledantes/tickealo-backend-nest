import { Controller, Get } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CreditosService } from './creditos.service';

@Roles(Role.Productora)
@Controller('creditos')
export class CreditosController {
  constructor(private readonly creditosService: CreditosService) {}

  @Get('historial')
  findAll(@GetUser('id') userId: number) {
    return this.creditosService.findAll(userId);
  }
}
