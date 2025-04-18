import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
} from 'typeorm';
import { Users } from './users.entity';
import { BaseEntity } from './base.entity';

/** 자주묻는 질문 */
@Entity('questions')
export class Questions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => Users, (user) => user.questions)
  author: Users;

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // FAQ 활성/비활성 여부
}
