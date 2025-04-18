import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Users } from './users.entity';
import { UserPoint } from './user_points.entity';
import { UserCoupon } from './user_coupon.entity';
import { BaseEntity } from './base.entity';

@Entity({ comment: '자녀 프로필 테이블' })
export class ChildrenProfile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, { onDelete: 'NO ACTION' })
  @JoinColumn()
  parent: Users;

  @Column({ length: 100, comment: '프로필 이름' })
  name: string;

  @Column({ type: 'varchar', comment: '생년월일' })
  birth_date: string;

  @Column({ type: 'varchar', comment: '자녀 프로필 텍스트', nullable: true })
  profile_text: string;

  @Column({ type: 'varchar', comment: '별명 타이틀', nullable: true })
  nickname_title: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female'],
    comment: '성별',
  })
  gender: string;

  // 기존의 ProfileImageFile 관계를 제거하고, profile_image_id 컬럼 추가
  @Column({ type: 'uuid', nullable: true, comment: '프로필 이미지 파일 id' })
  profile_image_id: string;

  @OneToMany(() => UserPoint, (userPoint) => userPoint.child)
  userPoints: UserPoint[];

  @OneToMany(() => UserCoupon, (userCoupon) => userCoupon.child)
  userCoupons: UserCoupon[];
}
