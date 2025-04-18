import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('doctor') // 의사 테이블
export class Doctor extends BaseEntity {
  @Column({ comment: '전문의 이름' })
  name: string;

  @Column({ comment: '전문의 분야' })
  specialty: string;

  @Column({ comment: '전문의 직책' })
  position: string;

  @Column({ comment: '전문의 이메일' })
  email: string;

  @Column({ comment: '전문의 상담 start 시간' })
  start_time: string;

  @Column({ comment: '전문의 상담 end 시간' })
  end_time: string;

  @Column({ comment: '병원 또는 소속 기관' })
  organization: string;
}
