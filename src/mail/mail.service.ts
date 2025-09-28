import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MailEntity } from './entities/mail.entity';
import { Repository } from 'typeorm';

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
      this.configService.get<boolean>('CAN_SEND_EMAILS', false) === true;
  }

  /**
   * Sends an email and logs the status in the database.
   * @param to - Recipient email address.
   * @param subject - Subject of the email.
   * @param html - HTML content of the email.
   * @param text - Plain text content of the email (optional).
   */
  async sendMail(to: string, subject: string, html: string, text?: string) {
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

  async sendVerificationEmail(to: string, code: string) {
    return await this.sendMail(
      to,
      'Email Verification',
      'Please verify your email using this code: ' + code,
      'Please verify your email using this code: ' + code,
    );
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
}
