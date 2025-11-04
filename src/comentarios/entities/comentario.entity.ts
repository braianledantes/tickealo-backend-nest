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
import { Evento } from '../../eventos/entities/evento.entity';

@Entity()
export class Comentario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'evento_id' })
  eventId: number;

  @ManyToOne(() => Evento, (evento) => evento.comentarios)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @ManyToOne(() => Cliente, (cliente) => cliente.comentarios)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'int', default: 0 })
  calificacion: number;

  @Column({ type: 'text' })
  comentario: string;

  @Column({ type: 'boolean', default: false })
  fijado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
