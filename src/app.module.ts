import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { ComprasModule } from './compras/compras.module';
import { CountriesModule } from './countries/countries.module';
import { CuentaBancariaModule } from './cuentabancaria/cuenta-bancaria.module';
import { DatabaseModule } from './database/database.module';
import { EventosModule } from './eventos/eventos.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { LugaresModule } from './lugares/lugares.module';
import { MailModule } from './mail/mail.module';
import { ProductoraModule } from './productora/productora.module';
import { RecordatoriosModule } from './recordatorios/recordatorios.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';
import { ValidadorModule } from './validador/validador.module';
import { MercadoPagoModule } from './mercado-pago/mercado-pago.module';
import { CreditosModule } from './creditos/creditos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
    ComprasModule,
    TicketsModule,
    ComentariosModule,
    FavoritosModule,
    RecordatoriosModule,
    CountriesModule,
    MercadoPagoModule,
    CreditosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
