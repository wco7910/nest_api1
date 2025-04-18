import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Users } from './users.entity';

@Entity('board_likes') // 게시글 좋아요 관계 테이블
@Unique(['user', 'board_id']) // 한 유저가 같은 게시글에 좋아요를 여러 번 누르지 않도록 설정
export class BoardLike extends BaseEntity {
  @Column({ type: 'uuid', comment: '게시글 아이디' })
  board_id: string;

  @ManyToOne(() => Users, { onDelete: 'NO ACTION' })
  user: Users;
}
