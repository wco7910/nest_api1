import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ArtCategorys } from './art_categories.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'art_levels', comment: '미술 레벨 테이블' })
export class ArtLevels extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ArtCategorys, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'category_id' })
  category: ArtCategorys;

  @Column({ type: 'int', comment: '레벨 번호', unique: false })
  level: number;
}
