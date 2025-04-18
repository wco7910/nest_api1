import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserCoupon } from './user_coupon.entity';
import { BaseEntity } from './base.entity';

/** 쿠폰 이름, 설명, 할인 금액, 유효 기간 등을 저장합니다.  */
@Entity('coupons')
export class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  discount_amount: number;

  @Column('date')
  valid_from: Date;

  @Column('date')
  valid_until: Date;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => UserCoupon, (userCoupon) => userCoupon.coupon)
  userCoupons: UserCoupon[];
}
