import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EnglishCategorys } from './english_categories.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'english_levels', comment: '영어 레벨 테이블' })
export class EnglishLevels extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EnglishCategorys, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'category_id' })
  category: EnglishCategorys;

  @Column({ type: 'int', comment: '레벨 번호', unique: false })
  level: number;

  @Column({ length: 50, comment: '레벨명', unique: false, nullable: true })
  level_title: string;
}
