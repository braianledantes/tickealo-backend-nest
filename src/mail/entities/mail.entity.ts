import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mail')
export class MailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  to: string;

  @Column()
  from: string;

  @Column()
  subject: string;

  @Column('text', { nullable: true })
  text: string;

  @Column('text', { nullable: true })
  html?: string;

  @Column({
    type: 'enum',
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  })
  status: 'sent' | 'failed' | 'pending';

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
