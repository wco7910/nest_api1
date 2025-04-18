import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Coupon } from './coupons.entity';
import { ChildrenProfile } from './children_profile.entity';
import { Users } from './users.entity';
import { BaseEntity } from './base.entity';

/** 특정 사용자( 프로필별 )가 보유한 쿠폰과 사용 여부(isUsed)를 저장합니다. */
@Entity('user_coupons')
export class UserCoupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.userCoupons, {
    onDelete: 'NO ACTION',
  })
  coupon: Coupon;

  @Column({ default: false })
  is_used: boolean;

  @Column('date', { comment: '쿠폰 만료일' })
  expiration_date: Date;

  @CreateDateColumn()
  assigned_at: Date;

  // 부모 정보도 함께 저장
  @ManyToOne(() => Users, { onDelete: 'NO ACTION' })
  @JoinColumn()
  user: Users;

  @ManyToOne(() => ChildrenProfile, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn()
  child: ChildrenProfile;
}
