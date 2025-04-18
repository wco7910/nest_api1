import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BlockCategorys } from './block_categories.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'block_levels', comment: '블록 레벨 테이블' })
export class BlockLevels extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BlockCategorys, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'category_id' })
  category: BlockCategorys;

  @Column({ type: 'int', comment: '레벨 번호', unique: false })
  level: number;
}
