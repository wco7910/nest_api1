import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MathCategorys } from './math_categories.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'math_levels', comment: '수학 레벨 테이블' })
export class MathLevels extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MathCategorys, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'category_id' })
  category: MathCategorys;

  @Column({ type: 'int', comment: '레벨 번호', unique: false })
  level: number;
}
