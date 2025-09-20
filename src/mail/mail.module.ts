import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow<string>('SMTP_HOST'),
          secure: configService.get<boolean>('SMTP_SECURE', false),
          auth: {
            user: configService.getOrThrow<string>('SMTP_USER'),
            pass: configService.getOrThrow<string>('SMTP_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"No Reply" <${configService.getOrThrow<string>('SMTP_FROM')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
