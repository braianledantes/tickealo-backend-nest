import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  sendVerificationEmail(to: string, code: string) {
    return this.mailService.sendMail({
      to,
      subject: 'Email Verification',
      text: 'Please verify your email using this code: ' + code,
    });
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

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Email - Tickealo</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .title {
            color: #2c3e50;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .verification-btn {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .verification-btn:hover {
            background-color: #2980b9;
          }
          .footer {
            font-size: 12px;
            color: #7f8c8d;
            text-align: center;
            margin-top: 30px;
            border-top: 1px solid #ecf0f1;
            padding-top: 20px;
          }
          .warning {
            background-color: #f39c12;
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎫 Tickealo</div>
          </div>
          
          <h2 class="title">¡Bienvenido ${username}!</h2>
          
          <div class="content">
            <p>Gracias por registrarte en Tickealo. Para completar tu registro, necesitamos verificar tu dirección de email.</p>
            
            <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="verification-btn">Verificar mi email</a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${verificationUrl}
            </p>
            
            <div class="warning">
              ⚠️ Este enlace expirará en 24 horas por motivos de seguridad.
            </div>
          </div>
          
          <div class="footer">
            <p>Si no creaste una cuenta en Tickealo, puedes ignorar este email.</p>
            <p>© 2025 Tickealo. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.mailService.sendMail({
      to,
      subject: '🎫 Verificación de Email - Tickealo',
      html: htmlTemplate,
      text: `¡Hola ${username}! Para verificar tu cuenta en Tickealo, visita: ${verificationUrl}`,
    });
  }
}
