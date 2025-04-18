import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity({ name: 'english_categories', comment: '영어 카테고리 테이블' })
export class EnglishCategorys extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true, comment: '카테고리 이름' })
  name: string;

  @Column({ type: 'int', comment: '오더 정렬', nullable: true, default: 0 })
  sort: number;
}
