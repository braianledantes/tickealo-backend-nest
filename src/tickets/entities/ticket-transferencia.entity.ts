import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Ticket } from './ticket.entity';

export enum EstadoTransferencia {
  PENDIENTE = 'pendiente',
  ACEPTADA = 'aceptada',
  RECHAZADA = 'rechazada',
}

@Entity()
export class TicketTransferencia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.transferenciasEnviadas, {
    onDelete: 'CASCADE',
  })
  clienteEmisor: Cliente;

  @ManyToOne(() => Cliente, (cliente) => cliente.transferenciasRecibidas, {
    onDelete: 'CASCADE',
  })
  clienteReceptor: Cliente;

  @ManyToOne(() => Ticket, (ticket) => ticket.transferencias, {
    onDelete: 'CASCADE',
  })
  ticket: Ticket;

  @Column({
    type: 'enum',
    enum: EstadoTransferencia,
    default: EstadoTransferencia.PENDIENTE,
  })
  status: EstadoTransferencia;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
