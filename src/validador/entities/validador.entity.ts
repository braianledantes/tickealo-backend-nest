import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Productora } from '../../productora/entities/productora.entity';

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

  @ManyToMany(() => Productora, (productora) => productora.validadores)
  productoras: Productora[];
}
