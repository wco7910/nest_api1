import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * 카테고리 > 여행지 정보, 위치, 등..
 */
@Entity('travel') // 테이블 이름을 'travel'로 변경
export class Travel extends BaseEntity {
  @Column({ type: 'varchar', length: 255, comment: '여행지 제목' })
  title: string;

  @Column({ type: 'varchar', length: 255, comment: '여행지 주소' })
  address: string;

  @Column({ type: 'varchar', length: 255, comment: '여행지 전화번호' })
  contact: string;

  @Column({ type: 'varchar', length: 255, comment: '여행지 웹사이트' })
  homepage: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '영업시간' })
  business_hours: string;

  @Column({ type: 'text', nullable: true })
  closeday_notice: string;

  @Column({ type: 'text', nullable: true })
  parking: string;

  @Column({ type: 'text', nullable: true })
  notice: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '여행지 소개',
    nullable: true,
  })
  introduction: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '여행지 요금',
    nullable: true,
  })
  fee: string;

  @Column({
    type: 'decimal', // 소수점이 있는 숫자 타입
    precision: 4, // 전체 자릿수 4자리
    scale: 2, // 소수점 이하 2자리
    default: 0, // 기본값 0
    comment: '별점 (0~5점)', // 도서 평가를 위한 별점 (0점에서 5점까지 가능)
  })
  rating: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: '위도',
  })
  latitude: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: '경도',
  })
  longitude: number;

  @Column({ comment: '사용여부', default: 'T' })
  in_used: string;
}
