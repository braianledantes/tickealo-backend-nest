import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { MercadoPagoService } from './mercado-pago.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateCreditoDto } from './dto/create-credito.dto';

@Controller('mercado-pago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Post('create-preference')
  createPreference(
    @GetUser() user: User,
    @Body() createCreditoDto: CreateCreditoDto,
  ) {
    return this.mercadoPagoService.createPreference(user, createCreditoDto);
  }

  @Public()
  @Get('success')
  paymentSuccess() {
    return { message: 'Payment successful' };
  }

  @Public()
  @Get('failure')
  paymentFailure() {
    return { message: 'Payment failed' };
  }

  @Public()
  @Get('pending')
  paymentPending() {
    return { message: 'Payment pending' };
  }

  @Public()
  @Post('webhook')
  handleWebhook(@Req() request: Request) {
    return this.mercadoPagoService.handleWebhook(request);
  }
}
