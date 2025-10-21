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
import { Comentario } from '../../comentarios/entities/comentario.entity';
import { Compra } from '../../compras/entities/compra.entity';
import { Evento } from '../../eventos/entities/evento.entity';
import { Productora } from '../../productora/entities/productora.entity';
import { Recordatorio } from '../../recordatorios/entities/recordatorio.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Cliente {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  telefono: string;

  @Column({ name: 'imagen_perfil_url', nullable: true, type: 'varchar' })
  imagenPerfilUrl: string | null;

  @Column({ name: 'puntos_acumulados', type: 'int', default: 0 })
  puntosAcumulados: number;

  @ManyToMany(() => Productora, (productora) => productora.seguidores)
  @JoinTable({
    name: 'clientes_productoras_seguidas',
    joinColumn: { name: 'cliente_id', referencedColumnName: 'userId' },
    inverseJoinColumn: {
      name: 'productora_id',
      referencedColumnName: 'userId',
    },
  })
  productorasSeguidas: Productora[];

  @OneToMany(() => Compra, (compra) => compra.cliente)
  compras: Compra[];

  @OneToMany(() => Ticket, (ticket) => ticket.cliente)
  tickets: Ticket[];

  @OneToMany(() => Comentario, (comentario) => comentario.cliente, {
    cascade: true,
  })
  comentarios: Comentario[];

  @ManyToMany(() => Evento, (evento) => evento.clientesFavoritos)
  @JoinTable({
    name: 'clientes_eventos_favoritos',
    joinColumn: { name: 'cliente_id', referencedColumnName: 'userId' },
    inverseJoinColumn: { name: 'evento_id', referencedColumnName: 'id' },
  })
  eventosFavoritos: Evento[];

  @OneToMany(() => Recordatorio, (recordatorio) => recordatorio.cliente)
  recordatorios: Recordatorio[];
}
