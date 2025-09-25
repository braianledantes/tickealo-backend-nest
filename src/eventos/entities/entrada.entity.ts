import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Evento } from './evento.entity';

@Entity()
export class Entrada {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Evento, (evento) => evento.entradas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @Column()
  tipo: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column()
  cantidad: number;
}
