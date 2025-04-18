import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'math_categories', comment: '수학 카테고리 테이블' })
export class MathCategorys extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true, comment: '카테고리 이름' })
  name: string;

  @Column({ type: 'int', comment: '오더 정렬', nullable: true, default: 0 })
  sort: number;
}
