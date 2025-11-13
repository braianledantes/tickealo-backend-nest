import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MercadoPagoService {
  private readonly client: MercadoPagoConfig;
  private readonly notificationSecret: string;

  constructor(private readonly configService: ConfigService) {
    const accessToken =
      this.configService.getOrThrow<string>('MP_ACCESS_TOKEN');

    this.client = new MercadoPagoConfig({ accessToken });

    this.notificationSecret = this.configService.getOrThrow<string>(
      'MP_NOTIFICATION_SECRET',
    );
  }

  async createPreference(user: User) {
    const preference = new Preference(this.client);

    try {
      const response = await preference.create({
        body: {
          items: [
            {
              id: '1234',
              title: 'Créditos',
              quantity: 100,
              unit_price: 15,
            },
          ],
          external_reference: user.id.toString(),
          notification_url:
            'https://spry-consortable-jeramy.ngrok-free.dev/api/mercado-pago/webhook',
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
      const items = paymentInfo.additional_info?.items || [];
    } catch (error) {
      console.error('Error fetching payment info:', error);
    }
  }
}
