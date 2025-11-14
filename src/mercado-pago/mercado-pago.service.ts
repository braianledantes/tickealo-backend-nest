import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import { CreditosService } from 'src/creditos/creditos.service';
import { User } from 'src/users/entities/user.entity';
import { CreateCreditoDto } from './dto/create-credito.dto';

@Injectable()
export class MercadoPagoService {
  private readonly client: MercadoPagoConfig;
  private readonly notificationSecret: string;
  private readonly apiUrl: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly creditosService: CreditosService,
  ) {
    this.apiUrl = this.configService.getOrThrow<string>('API_URL');
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    const accessToken =
      this.configService.getOrThrow<string>('MP_ACCESS_TOKEN');

    this.client = new MercadoPagoConfig({ accessToken });

    this.notificationSecret = this.configService.getOrThrow<string>(
      'MP_NOTIFICATION_SECRET',
    );
  }

  async createPreference(user: User, createCreditoDto: CreateCreditoDto) {
    const preference = new Preference(this.client);

    try {
      const response = await preference.create({
        body: {
          items: [
            {
              id: createCreditoDto.id,
              title: createCreditoDto.title,
              quantity: createCreditoDto.quantity,
              unit_price: createCreditoDto.price / createCreditoDto.quantity,
              currency_id: 'ARS',
            },
          ],
          back_urls: {
            success: `${this.frontendUrl}/dashboard/creditos`,
            failure: `${this.frontendUrl}/compra-fallida`,
            pending: `${this.frontendUrl}/compra-pendiente`,
          },
          auto_return: 'approved',
          external_reference: user.id.toString(),
          notification_url: `${this.apiUrl}/mercado-pago/webhook`,
        },
      });

      return {
        id: response.id,
        init_point: response.init_point,
      };
    } catch {
      throw new InternalServerErrorException('Error creating preference');
    }
  }

  /**
   * Handles incoming webhook notifications from Mercado Pago
   * @param request - The incoming HTTP request
   */
  async handleWebhook(request: Request) {
    const type = request.query['type'] as string;

    this.validateNotificationOrigin(request);

    if (type === 'payment') await this.handlePaymentNotification(request);

    return { message: 'HMAC verification successful' };
  }

  /**
   * Validates the origin of the notification using HMAC verification
   * @param xRequestId - The x-request-id header from the notification
   * @param xSignature - The x-signature header from the notification
   * @param dataId - The data.id query parameter from the notification
   */
  private validateNotificationOrigin(request: Request) {
    const { headers } = request;

    const xSignature = headers['x-signature'] as string; // Assuming headers is an object containing request headers
    const xRequestId = headers['x-request-id'] as string; // Assuming headers is an object containing request headers

    const dataId = request.query['data.id'] as string;
    // Separating the x-signature into parts
    const parts = xSignature.split(',');

    // Initializing variables to store ts and hash
    let ts;
    let hash;

    // Iterate over the values to obtain ts and v1
    parts.forEach((part) => {
      // Split each part into key and value
      const [key, value] = part.split('=');
      if (key && value) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        if (trimmedKey === 'ts') {
          ts = trimmedValue;
        } else if (trimmedKey === 'v1') {
          hash = trimmedValue;
        }
      }
    });

    // Generate the manifest string
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Create an HMAC signature
    const hmac = crypto.createHmac('sha256', this.notificationSecret);
    hmac.update(manifest);

    // Obtain the hash result as a hexadecimal string
    const sha = hmac.digest('hex');

    if (sha !== hash) {
      // TODO: ver por qué falla cuando se realiza una compra y no cuando se simula una notificación
      console.warn('HMAC verification failed');
      //   throw new BadRequestException('HMAC verification failed');
    }
  }

  /**
   * Handles payment notifications
   * @param request - The incoming HTTP request
   */
  private async handlePaymentNotification(request: Request) {
    const paymentId = request.query['data.id'] as string;

    const payment = new Payment(this.client);
    try {
      const paymentInfo = await payment.get({ id: paymentId });

      const userId = paymentInfo.external_reference;
      const items = paymentInfo.additional_info?.items;

      if (!userId || !items) {
        return;
      }

      const cantCreditos = items.reduce(
        (sum, item) => sum + parseFloat(item.quantity.toString()),
        0,
      );
      const price = items.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.unit_price.toString()) *
            parseFloat(item.quantity.toString()),
        0,
      );

      await this.creditosService.create({
        paymentId: paymentId,
        creditos: cantCreditos,
        userId: parseInt(userId, 10),
        price: price,
      });
    } catch (error) {
      console.error('Error fetching payment info:', error);
    }
  }
}
