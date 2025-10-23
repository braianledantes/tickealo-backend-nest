import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as soap from 'soap';

@Injectable()
export class MailSoapService implements OnModuleInit {
  private cliente: any;
  private readonly logger = new Logger(MailSoapService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const WSDL = this.configService.getOrThrow<string>('SOAP_MAIL_WSDL');
    try {
      this.cliente = await soap.createClientAsync(WSDL);
    } catch (error) {
      this.logger.error(
        'Error initializing SOAP Mail client: ' + (error as Error).message,
      );
    }
  }

  async sendEmail(to: string, subject: string, html: string, text: string) {
    if (!this.cliente) {
      throw new InternalServerErrorException(
        'SOAP Mail client is not initialized. Check SOAP_MAIL_WSDL configuration.',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const [result] = await this.cliente.SendEmailAsync({
      to,
      subject,
      html,
      text,
    });
    return result;
  }
}
