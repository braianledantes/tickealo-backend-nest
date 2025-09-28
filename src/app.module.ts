import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { CuentaBancariaModule } from './cuentabancaria/cuenta-bancaria.module';
import { LugaresModule } from './lugares/lugares.module';
import { EventosModule } from './eventos/eventos.module';
import { ProductoraModule } from './productora/productora.module';
import { ValidadorModule } from './validador/validador.module';
import { ClientesModule } from './clientes/clientes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MailModule,
    CuentaBancariaModule,
    LugaresModule,
    EventosModule,
    ProductoraModule,
    ValidadorModule,
    ClientesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
