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

  @Column({ type: 'decimal', precision: 11, scale: 8, unique: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, unique: true })
  longitud: number;

  @Column({ unique: true })
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
