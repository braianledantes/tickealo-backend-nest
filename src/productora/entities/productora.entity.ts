import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { HistorialCredito } from '../../creditos/entities/historial-credito.entity';
import { CuentaBancaria } from '../../cuentabancaria/entities/cuenta-bancaria.entity';
import { Evento } from '../../eventos/entities/evento.entity';
import { User } from '../../users/entities/user.entity';
import { Validador } from '../../validador/entities/validador.entity';

@Entity()
export class Productora {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
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

  @Column({ name: 'creditos_disponibles', type: 'int', default: 50 })
  creditosDisponibles: number;

  @Column({ type: 'float', default: 0 })
  calificacion: number;

  @Column({ nullable: false, default: 'Argentina' })
  pais: string;

  @OneToMany(() => Evento, (evento) => evento.productora)
  eventos: Evento[];

  @OneToMany(() => HistorialCredito, (historial) => historial.productora)
  historialCreditos: HistorialCredito[];

  @ManyToMany(() => Validador, (validador) => validador.productoras)
  @JoinTable({
    name: 'productoras_validadores',
    joinColumn: { name: 'productora_id', referencedColumnName: 'userId' },
    inverseJoinColumn: { name: 'validador_id', referencedColumnName: 'userId' },
  })
  validadores: Validador[];

  @ManyToMany(() => Cliente, (cliente) => cliente.productorasSeguidas)
  seguidores: Cliente[];
}
