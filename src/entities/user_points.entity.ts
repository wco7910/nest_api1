import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Users } from './users.entity';
import { ChildrenProfile } from './children_profile.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'user_points', comment: '사용자 포인트 총계 테이블' })
export class UserPoint extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, { onDelete: 'NO ACTION' })
  @JoinColumn()
  user: Users;

  @ManyToOne(() => ChildrenProfile, { onDelete: 'NO ACTION' })
  @JoinColumn()
  child: ChildrenProfile;

  /**
   * black, korean, art, english, math, coding
   */
  @Column({
    length: 10,
    comment: '포인트 카테고리(한글, 영어, 수학..)',
    nullable: true,
  })
  point_category: string;

  @Column({
    type: 'int',
    default: 0,
    comment: '사용자의 해당 카레고리 총 포인트',
  })
  total_points: number;
}
