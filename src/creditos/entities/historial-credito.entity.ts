import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Productora } from '../../productora/entities/productora.entity';

@Entity()
export class HistorialCredito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'payment_id', unique: true })
  paymentId: string;

  @Column({ type: 'int' })
  creditos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ name: 'creditos_previos', type: 'int' })
  creditosPrevios: number;

  @Column({ name: 'creditos_posterior', type: 'int' })
  creditosPosterior: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Productora, (productora) => productora.historialCreditos)
  productora: Productora;
}
