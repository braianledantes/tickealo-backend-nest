import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Repository } from 'typeorm';
import { MailEntity } from './entities/mail.entity';

@Injectable()
export class MailService {
  private readonly canSendEmails: boolean;

  constructor(
    @InjectRepository(MailEntity)
    private readonly mailRepository: Repository<MailEntity>,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.canSendEmails =
      this.configService.get<string>('CAN_SEND_EMAILS', 'false') === 'true';
  }

  /**
   * Sends an email and logs the status in the database.
   * @param to - Recipient email address.
   * @param subject - Subject of the email.
   * @param html - HTML content of the email.
   * @param text - Plain text content of the email (optional).
   */
  private async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    const mailRecord = this.mailRepository.create({
      to,
      from: this.configService.get<string>('SMTP_FROM'),
      subject,
      html,
      text,
      status: 'pending',
    });
    const mail = await this.mailRepository.save(mailRecord);
    try {
      // If email sending is disabled, skip sending but log the attempt
      if (!this.canSendEmails) {
        console.warn(
          `Email sending is disabled. Skipping email to ${to} with subject "${subject}".`,
        );
        return;
      }
      // Send the email
      await this.mailService.sendMail({
        to,
        from: this.configService.get<string>('SMTP_FROM'),
        subject,
        html,
        text,
      });
    } catch (error) {
      mail.status = 'failed';
      mail.errorMessage = (error as Error).message;
    } finally {
      if (mail.status !== 'failed') {
        mail.status = 'sent';
      }
      await this.mailRepository.save(mail);
    }
  }

  /**
   * Sends an email verification email with JWT token.
   * @param to - Recipient email address.
   * @param username - Username of the user.
   * @param verificationToken - JWT token for verification.
   */
  async sendEmailVerification(
    to: string,
    username: string,
    verificationToken: string,
  ): Promise<void> {
    const apiUrl = this.configService.get<string>(
      'API_URL',
      'http://localhost:3000',
    );
    const verificationUrl = `${apiUrl}/api/auth/verify-email?token=${verificationToken}`;

    const templatePaht = path.join(
      __dirname,
      'templates',
      'email-verification.html',
    );
    const htmlTemplate = await fs.readFile(templatePaht, 'utf-8');
    htmlTemplate
      .replace('{{username}}', username)
      .replace('{{verificationUrl}}', verificationUrl);

    await this.sendMail(
      to,
      '🎫 Verificación de Email - Tickealo',
      htmlTemplate,
      `¡Hola ${username}! Para verificar tu cuenta en Tickealo, visita: ${verificationUrl}`,
    );
  }

  /**
   * Sends an event reminder email to a client.
   * @param to - Recipient email address.
   * @param clienteNombre - Name of the client.
   * @param eventoNombre - Name of the event.
   * @param eventoInicioAt - Start date and time of the event.
   * @param eventoLugarNombre - Name of the event venue.
   * @param eventoLugarDireccion - Address of the event venue (optional).
   * @param eventoBannerUrl - URL of the event banner image (optional).
   * @param eventoId - ID of the event.
   * @param daysBefore - Number of days before the event.
   */
  async sendEventReminder(
    to: string,
    clienteNombre: string,
    eventoNombre: string,
    eventoInicioAt: Date,
    eventoLugarDireccion: string | null,
    eventoBannerUrl: string | null,
    eventoId: number,
    daysBefore: number,
  ): Promise<void> {
    const apiUrl = this.configService.get<string>(
      'API_URL',
      'http://localhost:3000',
    );
    const eventoUrl = `${apiUrl}/eventos/${eventoId}`;

    // Format date and time
    const eventoFecha = eventoInicioAt.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const eventoHora = eventoInicioAt.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Create reminder message based on days before
    let reminderMessage: string;
    if (daysBefore === 0) {
      reminderMessage = '¡El evento es HOY!';
    } else if (daysBefore === 1) {
      reminderMessage = '¡El evento es MAÑANA!';
    } else {
      reminderMessage = `El evento es en ${daysBefore} días`;
    }

    // Read and process the template
    const templatePath = path.join(
      __dirname,
      'templates',
      'event-reminder.html',
    );
    let htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    // Replace template variables
    htmlTemplate = htmlTemplate
      .replace(/{{clienteNombre}}/g, clienteNombre)
      .replace(/{{reminderMessage}}/g, reminderMessage)
      .replace(/{{eventoNombre}}/g, eventoNombre)
      .replace(/{{eventoFecha}}/g, eventoFecha)
      .replace(/{{eventoHora}}/g, eventoHora)
      .replace(/{{eventoUrl}}/g, eventoUrl);

    // Handle optional fields
    if (eventoBannerUrl) {
      htmlTemplate = htmlTemplate
        .replace(/{{#if eventoBannerUrl}}/g, '')
        .replace(/{{\/if}}/g, '')
        .replace(/{{eventoBannerUrl}}/g, eventoBannerUrl);
    } else {
      // Remove the banner section if no banner URL
      htmlTemplate = htmlTemplate.replace(
        /{{#if eventoBannerUrl}}[\s\S]*?{{\/if}}/g,
        '',
      );
    }

    if (eventoLugarDireccion) {
      htmlTemplate = htmlTemplate
        .replace(/{{#if eventoLugarDireccion}}/g, '')
        .replace(/{{eventoLugarDireccion}}/g, eventoLugarDireccion);
    } else {
      // Remove the address section if no address
      htmlTemplate = htmlTemplate.replace(
        /{{#if eventoLugarDireccion}}[\s\S]*?{{\/if}}/g,
        '',
      );
    }

    // Plain text version
    const textContent = `¡Hola ${clienteNombre}! ${reminderMessage}

Evento: ${eventoNombre}
Fecha: ${eventoFecha}
Hora: ${eventoHora}
${eventoLugarDireccion ? `Dirección: ${eventoLugarDireccion}` : ''}

Ver más detalles: ${eventoUrl}

¡Nos vemos allí!`;

    await this.sendMail(
      to,
      `🎫 Recordatorio: ${eventoNombre} - Tickealo`,
      htmlTemplate,
      textContent,
    );
  }

  /**
   * Sends a ticket transfer notification email to the recipient.
   * @param to - Recipient email address.
   * @param receptorNombre - Name of the ticket recipient.
   * @param emisorNombre - Name of the ticket sender.
   * @param eventoNombre - Name of the event.
   * @param entradaNombre - Name of the ticket type.
   * @param eventoInicioAt - Start date and time of the event.
   * @param transferenciaId - ID of the transfer.
   */
  async sendTicketTransferNotification(
    to: string,
    receptorNombre: string,
    emisorNombre: string,
    eventoNombre: string,
    entradaNombre: string,
    eventoInicioAt: Date,
    transferenciaId: number,
  ): Promise<void> {
    const apiUrl = this.configService.get<string>(
      'API_URL',
      'http://localhost:3000',
    );
    const aceptarUrl = `${apiUrl}/transferencias/${transferenciaId}/aceptar`;

    // Format date and time
    const eventoFecha = eventoInicioAt.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const eventoHora = eventoInicioAt.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Read and process the template
    const templatePath = path.join(
      __dirname,
      'templates',
      'ticket-transfer.html',
    );
    let htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    // Replace template variables
    htmlTemplate = htmlTemplate
      .replace(/{{receptorNombre}}/g, receptorNombre)
      .replace(/{{emisorNombre}}/g, emisorNombre)
      .replace(/{{eventoNombre}}/g, eventoNombre)
      .replace(/{{entradaNombre}}/g, entradaNombre)
      .replace(/{{eventoFecha}}/g, eventoFecha)
      .replace(/{{eventoHora}}/g, eventoHora)
      .replace(/{{aceptarUrl}}/g, aceptarUrl);

    // Plain text version
    const textContent = `¡Hola ${receptorNombre}!

${emisorNombre} te ha transferido un ticket para el evento "${eventoNombre}".

Detalles del evento:
- Tipo de Entrada: ${entradaNombre}
- Fecha: ${eventoFecha}
- Hora: ${eventoHora}

Para aceptar esta transferencia, visita: ${aceptarUrl}

¡Nos vemos allí!`;

    await this.sendMail(
      to,
      `🎫 Transferencia de Ticket: ${eventoNombre} - Tickealo`,
      htmlTemplate,
      textContent,
    );
  }
}
