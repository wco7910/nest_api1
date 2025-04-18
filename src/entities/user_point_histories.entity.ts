import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Users } from './users.entity';
import { ChildrenProfile } from './children_profile.entity';
import { BaseEntity } from './base.entity';

@Entity({
  name: 'user_point_histories',
  comment: '사용자 포인트 변경 내역 테이블',
})
export class UserPointHistory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, { onDelete: 'NO ACTION' })
  user: Users;

  @ManyToOne(() => ChildrenProfile, { onDelete: 'NO ACTION' })
  child: ChildrenProfile;

  @Column({
    length: 10,
    comment: '포인트 카테고리(한글, 영어, 수학..)',
    nullable: true,
  })
  point_category: string;

  @Column({ type: 'int', comment: '변경된 포인트 값 (양수 또는 음수)' })
  point_change: number;

  @Column({
    length: 255,
    comment: '포인트 변경 이유 (게임 성공, 보상 등)',
    nullable: true,
  })
  description: string;
}
