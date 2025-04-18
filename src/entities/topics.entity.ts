import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
// 관심 주제 테이블
@Entity()
export class Topic extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '관심 주제 이름' })
  name: string;

  @Column({ length: 100, comment: '관심 주제 키워드', nullable: true })
  keyword: string;

  @Column({ comment: '사용여부', default: 'T' })
  in_used: string;

  @Column({ comment: '정렬 순서', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: '파일 경로', nullable: true })
  path: string;
}
