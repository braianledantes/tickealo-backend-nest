import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('send-email')
  async sendTestEmail() {
    const to = 'braianledantes@gmail.com';
    const subject = 'Correo de prueba desde NestJS con Resend';
    const html = '<h1>¡Hola Mundo!</h1><p>Este es un correo de prueba.</p>';

    try {
      const result = await this.mailService.sendMail(to, subject, html);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
