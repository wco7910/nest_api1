import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CounselingComment } from './counseling_comment.entity';
import { BoardLike } from './board_likes.entity';

/**
 * 
  parenting_counseling	육아 상담 게시글을 저장하는 테이블 (전문의 댓글이 달리기 전까지 비공개)
  expert_profile	관리자가 등록한 전문의 정보 테이블
  counseling_comment	특정 육아 상담 게시글에 전문의가 남긴 댓글을 저장하는 테이블
  counseling_like	일반 유저가 좋아요를 누를 수 있는 테이블 (유저당 한 번만 가능)
 *
 */

/**
   * 육아 상담글이 댓글이 달리기 전까지는 is_visible = false
      첫 번째 댓글이 달리면 is_visible = true로 변경됨.
      전문의(expert_profile)만 counseling_comment 테이블에 댓글 작성 가능
      일반 유저는 댓글을 달 수 없음.
      일반 유저(users)는 counseling_like 테이블을 통해 좋아요 가능
      같은 유저가 같은 글에 여러 번 좋아요를 누르지 못하게 Unique(['user', 'counseling']) 설정.
   */

@Entity('parenting_counseling') // 육아 상담 테이블
export class ParentingCounseling extends BaseEntity {
  @Column({
    type: 'uuid',
    comment: '토픽 주제( 카테고리 ) 아이디',
    nullable: true,
  })
  topic_id: string;

  @Column({ type: 'varchar', length: 255, comment: '게시글 제목' })
  title: string;

  @Column({
    type: 'uuid',
    comment: '작성자 아이디',
    nullable: true, // 임시
  })
  user_id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '작성자 프로필 이미지 URL',
  })
  user_image: string;

  @Column({ type: 'text', comment: '게시글 내용' })
  content: string;

  // @Column({ type: 'int', default: 0, comment: '좋아요 개수' })
  // like_count: number;

  @Column({ type: 'int', default: 0, comment: '댓글 개수' })
  comment_count: number;

  @Column({ type: 'boolean', default: false, comment: '비밀글 여부' })
  is_secret: boolean;

  //육아 상담 글이 전문의의 댓글이 달릴 때까지 비공개(is_visible) 상태로 유지됩니다.
  @Column({ type: 'boolean', default: false, comment: '댓글이 달리면 공개' })
  is_visible: boolean; // 댓글이 달릴 때 true로 변경

  @OneToMany(() => CounselingComment, (comment) => comment.counseling)
  comments: CounselingComment[];

  @OneToMany(() => BoardLike, (like) => like.board_id)
  likes: BoardLike[];
}
