import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'block_categories', comment: '블록 카테고리 테이블' })
export class BlockCategorys extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true, comment: '카테고리 이름' })
  name: string;

  @Column({ type: 'int', comment: '오더 정렬', nullable: true })
  sort: number;

  @Column({ type: 'boolean', comment: '삭제 여부', default: true })
  is_use: boolean;

  @Column({
    length: 100,
    comment: '카테고리 아이콘 path',
    nullable: true,
    default: 0,
  })
  icon_path: string;
}
