import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { EstadoCompra } from '../enums/estado-compra.enum';

@Entity()
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: EstadoCompra, default: EstadoCompra.PENDIENTE })
  estado: EstadoCompra;

  @Column({ name: 'comprobante_transferencia' })
  comprobanteTransferencia: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @JoinColumn({ name: 'cliente_id' })
  @ManyToOne(() => Cliente, (cliente) => cliente.compras)
  cliente: Cliente;

  @OneToMany(() => Ticket, (ticket) => ticket.compra)
  tickets: Ticket[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
