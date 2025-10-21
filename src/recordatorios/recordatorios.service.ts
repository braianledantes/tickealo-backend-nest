import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientesService } from 'src/clientes/clientes.service';
import { EventosService } from 'src/eventos/services/eventos.service';
import { MailService } from 'src/mail/mail.service';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Recordatorio } from './entities/recordatorio.entity';

@Injectable()
export class RecordatoriosService {
  constructor(
    @InjectRepository(Recordatorio)
    private readonly recordatorioRepository: Repository<Recordatorio>,
    private readonly eventosService: EventosService,
    private readonly clientesService: ClientesService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Creates recordatorios for a given cliente and evento.
   * @param clienteId - ID of the cliente (user).
   * @param eventoId - ID of the evento.
   * @returns Promise<void>
   * @throws NotFoundException if cliente or evento is not found.
   */
  async createRecordatorios(
    clienteId: number,
    eventoId: number,
  ): Promise<void> {
    const cliente = await this.clientesService.findOneById(clienteId);
    const evento = await this.eventosService.findOneById(eventoId);

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    const r10 = this.recordatorioRepository.create({
      cliente,
      evento,
      daysBefore: 10,
    });

    const r5 = this.recordatorioRepository.create({
      cliente,
      evento,
      daysBefore: 5,
    });

    const r1 = this.recordatorioRepository.create({
      cliente,
      evento,
      daysBefore: 1,
    });

    const r0 = this.recordatorioRepository.create({
      cliente,
      evento,
      daysBefore: 0,
    });

    await this.recordatorioRepository.save([r10, r5, r1, r0]);
  }

  /**
   * Removes recordatorios for a given cliente and evento.
   * @param userId - ID of the cliente (user).
   * @param eventoId - ID of the evento.
   * @returns Promise<void>
   * @throws NotFoundException if no recordatorios are found to delete.
   */
  async removeRecordatorios(userId: number, eventoId: number): Promise<void> {
    const recordatorios = await this.recordatorioRepository.find({
      where: {
        cliente: { userId: userId },
        evento: { id: eventoId },
      },
    });

    if (recordatorios.length === 0) {
      throw new NotFoundException(
        'No se encontraron recordatorios para eliminar',
      );
    }

    await this.recordatorioRepository.remove(recordatorios);
  }

  /**
   * Cron job that checks for recordatorios to be sent every hour.
   * Sends reminder emails if the current date matches the reminder date.
   */
  @Cron('0 * * * *')
  async checkRecordatorios() {
    const now = new Date();
    const recordatorios = await this.recordatorioRepository.find({
      where: {
        evento: { inicioAt: MoreThan(now) },
        sentAt: IsNull(),
      },
      relations: ['cliente', 'cliente.user', 'evento', 'evento.lugar'],
    });

    for (const recordatorio of recordatorios) {
      const eventoInicio = recordatorio.evento.inicioAt;
      const reminderDate = new Date(
        eventoInicio.getTime() - recordatorio.daysBefore * 24 * 60 * 60 * 1000,
      );
      if (now >= reminderDate) {
        await this.mailService.sendEventReminder(
          recordatorio.cliente.user.email,
          recordatorio.cliente.nombre,
          recordatorio.evento.nombre,
          recordatorio.evento.inicioAt,
          recordatorio.evento.lugar.direccion || null,
          recordatorio.evento.bannerUrl || null,
          recordatorio.evento.id,
          recordatorio.daysBefore,
        );
        recordatorio.sentAt = new Date();
        await this.recordatorioRepository.save(recordatorio);
      }
    }
  }
}
