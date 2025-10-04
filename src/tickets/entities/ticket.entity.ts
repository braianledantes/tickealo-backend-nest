import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Compra } from '../../compras/entities/compra.entity';
import { Entrada } from '../../eventos/entities/entrada.entity';
import { EstadoTicket } from '../enums/estado-ticket.enum';

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
    default: EstadoTicket.COMPRA_PENDIENTE,
  })
  estado: EstadoTicket;

  @JoinColumn({ name: 'cliente_id' })
  @ManyToOne(() => Cliente, (cliente) => cliente.tickets)
  cliente: Cliente;

  @JoinColumn({ name: 'entrada_id' })
  @ManyToOne(() => Entrada, (entrada) => entrada.tickets)
  entrada: Entrada;

  @JoinColumn({ name: 'compra_id' })
  @ManyToOne(() => Compra, (compra) => compra.tickets)
  compra: Compra;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
