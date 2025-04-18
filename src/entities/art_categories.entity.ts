import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'art_categories', comment: '미술 카테고리 테이블' })
export class ArtCategorys extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true, comment: '카테고리 이름' })
  name: string;

  @Column({ type: 'int', comment: '오더 정렬', nullable: true, default: 0 })
  sort: number;

  @Column({
    length: 100,
    comment: '카테고리 아이콘 path',
    nullable: true,
    default: 0,
  })
  icon_path: string;
}
