import {
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Productora } from '../../productora/entities/productora.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity()
export class Validador {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => Cliente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  cliente: Cliente;

  @ManyToMany(() => Productora, (productora) => productora.validadores)
  productoras: Productora[];

  @OneToMany(() => Ticket, (ticket) => ticket.validatedBy)
  tickets: Ticket[];
}
