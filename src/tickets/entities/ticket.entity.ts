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
import { Compra } from '../../compras/entities/compra.entity';
import { Entrada } from '../../eventos/entities/entrada.entity';
import { Validador } from '../../validador/entities/validador.entity';
import { EstadoTicket } from '../enums/estado-ticket.enum';
import { TicketTransferencia } from './ticket-transferencia.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Código alfanumérico único de 7 caracteres (letras mayúsculas y números) para identificar el ticket.
   * Formato: 'AG7 H3K'
   */
  @Column({
    name: 'codigo_alfanumerico',
    type: 'varchar',
    length: 7,
    unique: true,
    nullable: false,
  })
  codigoAlfanumerico: string;

  @Column({
    type: 'enum',
    enum: EstadoTicket,
    default: EstadoTicket.INICIADO,
  })
  estado: EstadoTicket;

  @JoinColumn({ name: 'cliente_id' })
  @ManyToOne(() => Cliente, (cliente) => cliente.tickets)
  cliente: Cliente;

  @Column({ name: 'entrada_id' })
  entradaId: number;

  @JoinColumn({ name: 'entrada_id' })
  @ManyToOne(() => Entrada, (entrada) => entrada.tickets)
  entrada: Entrada;

  @JoinColumn({ name: 'compra_id' })
  @ManyToOne(() => Compra, (compra) => compra.tickets, {
    nullable: true,
  })
  compra: Compra | null;

  @JoinColumn({ name: 'validated_by' })
  @ManyToOne(() => Validador, (validator) => validator.tickets, {
    nullable: true,
  })
  validatedBy?: Validador;

  @OneToMany(() => TicketTransferencia, (transferencia) => transferencia.ticket)
  transferencias: TicketTransferencia[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
