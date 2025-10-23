import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({ summary: 'Enviar un correo electrónico de prueba' })
  @ApiResponse({
    status: 200,
    description: 'Correo electrónico de prueba enviado correctamente',
    schema: {
      example: { message: 'Email de prueba enviado' },
    },
  })
  @Public()
  @Get('send-test-email')
  async sendTestEmail(
    @Query('to') to: string,
    @Query('username') username: string,
    @Query('token') token: string,
  ) {
    await this.mailService.sendEmailVerification(to, username, token);
    return { message: 'Email de prueba enviado' };
  }
}
