import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity({ name: 'korean_categories', comment: '한글 카테고리 테이블' })
export class KoreanCategorys extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true, comment: '카테고리 이름' })
  name: string;

  @Column({ type: 'int', comment: '오더 정렬', nullable: true, default: 0 })
  sort: number;
}
