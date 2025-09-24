import {
  Column,
  CreateDateColumn,
  Entity,
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
