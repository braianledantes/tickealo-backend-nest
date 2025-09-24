import { CuentaBancaria } from '../../cuentabancaria/entities/cuenta-bancaria.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Productora {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  cuit: string;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @Column()
  telefono: string;

  @OneToOne(() => CuentaBancaria, (cuentaBancaria) => cuentaBancaria.productora)
  cuentaBancaria?: CuentaBancaria;

  @Column({ name: 'imagen_url', nullable: true, type: 'varchar' })
  imagenUrl: string | null;

  @Column({ name: 'creditos_disponibles', type: 'int', default: 0 })
  creditosDisponibles: number;

  @Column({ type: 'float', default: 0 })
  calificacion: number;
}
