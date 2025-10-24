import { Evento } from '../../eventos/entities/evento.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Lugar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 17, scale: 14 })
  latitud: number;

  @Column({ type: 'decimal', precision: 17, scale: 14 })
  longitud: number;

  @Column()
  direccion: string;

  @Column()
  ciudad: string;

  @Column()
  provincia: string;

  @Column({ default: 'Argentina' })
  pais: string;

  @Column({ name: 'iso_codigo_pais', length: 2, default: 'AR' })
  isoCodigoPais: string;

  @OneToMany(() => Evento, (evento) => evento.lugar)
  eventos: Evento[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
