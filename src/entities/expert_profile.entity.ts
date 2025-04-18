import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CounselingComment } from './counseling_comment.entity';

@Entity('expert_profile') // 전문의 테이블
export class ExpertProfile extends BaseEntity {
  @Column({ type: 'varchar', length: 100, comment: '전문의 이름' })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, comment: '이메일' })
  email: string;

  @Column({ type: 'varchar', length: 100, comment: '전문의 분야' })
  specialty: string;

  @Column({ type: 'text', nullable: true, comment: '전문의 소개' })
  bio: string;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: '전문의 프로필 이미지 URL',
  })
  profile_image_id: string;

  @Column({ type: 'varchar', length: 50, comment: '병원 또는 소속 기관' })
  organization: string;

  @Column({ type: 'boolean', default: true, comment: '활동 여부' })
  is_active: boolean;

  @OneToMany(() => CounselingComment, (comment) => comment.doctor_id)
  comments: CounselingComment[];
}
