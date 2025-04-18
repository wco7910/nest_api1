import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserPoint } from './user_points.entity';
import { UserCoupon } from './user_coupon.entity';
import { Questions } from './questions.entity';
import { BaseEntity } from './base.entity';
import { ChildrenTestStatus } from './children_test_status.entity';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '로컬 아이디', nullable: true })
  user_id: string;

  @Column({
    comment: '유저 비밀번호(로컬 회원가입 시 사용, 소셜 로그인 시 NULL)',
    nullable: true,
  })
  password: string;

  @BeforeInsert()
  async setPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @Column({ comment: '유저 이름' })
  username: string;

  @Column({ comment: '이메일' })
  email: string;

  @Column({ comment: '우편번호', nullable: true })
  zip_code: string;

  @Column({ comment: '회사주소', nullable: true })
  address: string;

  @Column({ comment: '상세주소', nullable: true })
  address_detail: string;

  @Column({
    type: 'enum',
    enum: ['local', 'google', 'naver', 'kakao'],
    comment: '(local/google/naver/kakao)',
  })
  provider: string;

  @Column({
    comment: '소셜 로그인 제공자 고유 ID (Google, Naver, Kakao에서 제공)',
    nullable: true,
    unique: true,
  })
  provider_id: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female'],
    comment: '성별 (male/female)',
  })
  gender: string;

  @Column({ type: 'date', comment: '생년월일' })
  birthdate: Date;

  @Column({ default: true, comment: '회원 삭제 플래그' })
  is_active: boolean;

  @Column({ default: true, comment: '약관 동의 여부' })
  term_agreements: boolean;

  @Column({ type: 'boolean', default: true })
  isFirstLogin: boolean;

  @Column({ length: 50, nullable: true })
  grow_learning_password: string;

  @OneToMany(() => UserPoint, (userPoint) => userPoint.user)
  userPoints: UserPoint[];

  @OneToMany(() => ChildrenTestStatus, (testStatus) => testStatus.user)
  testStatus: ChildrenTestStatus[];

  @OneToMany(() => UserCoupon, (userCoupon) => userCoupon.user)
  userCoupons: UserCoupon[];

  @OneToMany(() => Questions, (questions) => questions.author)
  questions: Questions[];

  // 기존의 ProfileImageFile 관계를 제거하고, profile_image_id 컬럼 추가
  @Column({ type: 'uuid', nullable: true, comment: '프로필 이미지 파일 id' })
  profile_image_id: string;

}
