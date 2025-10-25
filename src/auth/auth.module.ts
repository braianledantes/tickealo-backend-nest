import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ClientesModule } from 'src/clientes/clientes.module';
import { FilesModule } from 'src/files/files.module';
import { MailModule } from 'src/mail/mail.module';
import { ProductoraModule } from 'src/productora/productora.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthEmailService } from './services/auth-email.service';
import { AuthLoginService } from './services/auth-login.service';
import { AuthProfileService } from './services/auth-profile.service';
import { AuthRegisterService } from './services/auth-register.service';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthGoogleService } from './services/auth-google.service';

@Module({
  imports: [
    UsersModule,
    ProductoraModule,
    ClientesModule,
    FilesModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME', '1h'),
        },
      }),
    }),
    MailModule,
  ],
  providers: [
    AuthService,
    AuthLoginService,
    AuthRegisterService,
    AuthEmailService,
    AuthProfileService,
    AuthGoogleService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
