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
import { Lugar } from '../../lugares/entities/lugar.entity';
import { Entrada } from './entrada.entity';
import { Productora } from '../../productora/entities/productora.entity';
import { CuentaBancaria } from '../../cuentabancaria/entities/cuenta-bancaria.entity';

@Entity()
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Productora, (productora) => productora.eventos, {
    eager: true,
  })
  @JoinColumn({ name: 'productora_id' })
  productora: Productora;

  @Column()
  nombre: string;

  @Column()
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

  @ManyToOne(() => Lugar, (lugar) => lugar.eventos, { eager: true })
  @JoinColumn({ name: 'lugar_id' })
  lugar: Lugar;

  @OneToMany(() => Entrada, (entrada) => entrada.evento, {
    cascade: true,
    eager: true,
  })
  entradas: Entrada[];

  @ManyToOne(() => CuentaBancaria, (cb) => cb.eventos, { eager: true })
  @JoinColumn({ name: 'cuenta_bancaria_id' })
  cuentaBancaria: CuentaBancaria;

  @Column({ default: 0 })
  capacidad: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
