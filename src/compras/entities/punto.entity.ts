import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Compra } from './compra.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity()
export class Punto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'puntos_usados', type: 'int', nullable: false })
  puntosUsados: number;

  @Column({ name: 'puntos_ganados', type: 'int', nullable: false })
  puntosGanados: number;

  @Column({ name: 'puntos_previos', type: 'int', nullable: false })
  puntosPrevios: number;

  @Column({ name: 'puntos_obtenidos', type: 'int', nullable: false })
  puntosObtenidos: number;

  @Column({ name: 'fecha_vencimiento', type: 'timestamp', nullable: false })
  fechaVencimiento: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Cliente, (cliente) => cliente.puntos, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;

  @ManyToOne(() => Compra, (compra) => compra.punto, {
    onDelete: 'CASCADE',
  })
  compra: Compra;
}
