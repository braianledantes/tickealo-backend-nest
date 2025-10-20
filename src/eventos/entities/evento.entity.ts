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
import { Comentario } from '../../comentarios/entities/comentario.entity';
import { CuentaBancaria } from '../../cuentabancaria/entities/cuenta-bancaria.entity';
import { Lugar } from '../../lugares/entities/lugar.entity';
import { Productora } from '../../productora/entities/productora.entity';
import { Entrada } from './entrada.entity';

@Entity()
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Productora, (productora) => productora.eventos)
  @JoinColumn({ name: 'productora_id' })
  productora: Productora;

  @Column()
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'inicio_at', type: 'timestamp' })
  inicioAt: Date;

  @Column({ name: 'fin_at', type: 'timestamp' })
  finAt: Date;

  @Column({ default: false })
  cancelado: boolean;

  @Column({ name: 'portada_url', nullable: true })
  portadaUrl: string;

  @Column({ name: 'banner_url', nullable: true })
  bannerUrl: string;

  @ManyToOne(() => Lugar, (lugar) => lugar.eventos)
  @JoinColumn({ name: 'lugar_id' })
  lugar: Lugar;

  @OneToMany(() => Entrada, (entrada) => entrada.evento, {
    cascade: true,
  })
  entradas: Entrada[];

  @ManyToOne(() => CuentaBancaria, (cb) => cb.eventos)
  @JoinColumn({ name: 'cuenta_bancaria_id' })
  cuentaBancaria: CuentaBancaria;

  @Column({ default: 0 })
  capacidad: number;

  @Column({ name: 'stock_entradas', default: 0 })
  stockEntradas: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Comentario, (comentario) => comentario.evento, {
    cascade: true,
  })
  comentarios: Comentario[];
}
