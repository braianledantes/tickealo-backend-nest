import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Validador {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  nombre: string;

  @Column({ name: 'imagen_perfil_url', nullable: true, type: 'varchar' })
  imagenPerfilUrl: string | null;
}
