import {
  Column,
  Entity,
} from 'typeorm';
import { BaseEntity } from './base.entity';

// faq
@Entity('faq')
export class Faq extends BaseEntity {

  @Column()
  category: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column('uuid')
  answered_by: string;
}
