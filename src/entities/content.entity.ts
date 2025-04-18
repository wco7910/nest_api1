import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * 콘테스트, 발달, 육아정보 탭 공통 게시글 테이블
 */
@Entity('content')
export class Content extends BaseEntity {
  /**  커뮤니티 게시판 별 카테고리 키값 */
  @Column({ comment: '카테고리', nullable: true })
  category: string;

  /** 공통 */
  @Column({ comment: '제목' })
  title: string;

  @Column({ comment: '내용', type: 'text', nullable: true })
  body: string;

  @Column({ comment: '폰번호', nullable: true })
  phone: string;

  @Column({ comment: '유저 아이디', type: 'uuid', nullable: true })
  user_id: string;

  @Column({ comment: '토픽', nullable: true })
  topic: string;

  @Column({ comment: '조회수', nullable: true })
  view_count: number;

  @Column({ comment: '좋아요', nullable: true })
  like_count: number;
}
