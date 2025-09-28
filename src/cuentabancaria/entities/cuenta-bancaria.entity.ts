import { Evento } from '../../eventos/entities/evento.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Productora } from '../../productora/entities/productora.entity';

@Entity({ name: 'cuenta_bancaria' })
export class CuentaBancaria {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Productora, (productora) => productora.cuentaBancaria, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productora_id' })
  productora: Productora;

  @Column({ name: 'nombre_titular' })
  nombreTitular: string;

  @Column({ name: 'nombre_banco' })
  nombreBanco: string;

  @Column()
  alias: string;

  @Column()
  cbu: string;

  @Column()
  instrucciones: string;

  @OneToMany(() => Evento, (evento) => evento.cuentaBancaria)
  eventos: Evento[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
