import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { MailService } from './mail/mail.service';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @ApiOperation({ summary: 'Verificar estado de la API' })
  @ApiResponse({
    status: 200,
    description: 'La API está funcionando correctamente',
  })
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
