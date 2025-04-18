import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KoreanCategorys } from './korean_categories.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'korean_levels', comment: '한글 레벨 테이블' })
export class KoreanLevels extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => KoreanCategorys, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'category_id' })
  category: KoreanCategorys;

  @Column({ type: 'int', comment: '레벨 번호', unique: false })
  level: number;

  @Column({ length: 50, comment: '레벨명', unique: false, nullable: true })
  level_title: string;
}
