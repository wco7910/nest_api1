import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('books') // 테이블 이름을 'books'로 변경
export class Book extends BaseEntity {
  @Column({ type: 'varchar', length: 255, comment: '도서 제목' })
  title: string;

  @Column({ type: 'varchar', length: 255, comment: '저자' })
  author: string;

  @Column({ type: 'varchar', length: 255, comment: '출판사' })
  publisher: string;

  @Column({
    type: 'decimal', // 소수점이 있는 숫자 타입
    precision: 4, // 전체 자릿수 4자리
    scale: 2, // 소수점 이하 2자리
    default: 0, // 기본값 0
    comment: '별점 (0~5점)', // 도서 평가를 위한 별점 (0점에서 5점까지 가능)
  })
  rating: number;

  @Column({ type: 'text', nullable: true, comment: '도서 설명' })
  body: string;

  @Column({ nullable: true, comment: '도서 책' })
  book: string;

  @Column({ comment: '추천도서', nullable: true })
  recommend_book: boolean;

  @Column({ comment: '주목받는 도서', nullable: true })
  hot_book: boolean;

  @Column({ comment: '사용여부', default: 'T' })
  in_used: string;
}
