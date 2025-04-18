import { Entity, Column, ManyToOne, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ParentingCounseling } from './parenting_counseling.entity';

@Entity('counseling_comment') // 육아 상담 댓글 테이블
export class CounselingComment extends BaseEntity {
  @Column({ type: 'text', comment: '댓글 내용' })
  content: string;

  @Column({ type: 'int', comment: '좋아요 수', default: 0 })
  like: number;

  @ManyToOne(() => ParentingCounseling, (counseling) => counseling.comments, {
    onDelete: 'CASCADE',
  })
  counseling: ParentingCounseling;

  @Column({ type: 'uuid', comment: '의사 아이디' })
  doctor_id: string;

  @BeforeInsert()
  async updateVisibility() {
    this.counseling.is_visible = true; // 첫 댓글이 달릴 때 상담글을 공개 상태로 변경
  }
}
